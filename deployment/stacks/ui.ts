import { Construct } from "constructs";
import {
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfrontOrigins,
  aws_iam as iam,
  aws_kinesisfirehose as firehose,
  aws_s3 as s3,
  aws_wafv2 as wafv2,
  Duration,
  RemovalPolicy,
  aws_certificatemanager as acm,
} from "aws-cdk-lib";
import { addIamPropertiesToBucketAutoDeleteRole } from "../utils/s3";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface CreateUiComponentsProps {
  scope: Construct;
  stage: string;
  project: string;
  isDev: boolean;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
  cloudfrontCertificateArn: string;
  cloudfrontDomainName: string;
  vpnIpSetArn: string;
  vpnIpv6SetArn: string;
}

export function createUiComponents(props: CreateUiComponentsProps) {
  const {
    scope,
    stage,
    project,
    isDev,
    iamPermissionsBoundary,
    iamPath,
    cloudfrontCertificateArn,
    cloudfrontDomainName,
    vpnIpSetArn,
    vpnIpv6SetArn,
  } = props;
  // S3 Bucket for UI hosting
  const uiBucket = new s3.Bucket(scope, "uiBucket", {
    encryption: s3.BucketEncryption.S3_MANAGED,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    enforceSSL: true,
  });

  const logBucket = new s3.Bucket(scope, "CloudfrontLogBucket", {
    encryption: s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    autoDeleteObjects: isDev,
    enforceSSL: true,
  });

  // Add bucket policy to allow CloudFront to write logs
  logBucket.addToResourcePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
      actions: ["s3:PutObject"],
      resources: [`${logBucket.bucketArn}/*`],
    })
  );

  const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
    scope,
    "CloudFormationHeadersPolicy",
    {
      responseHeadersPolicyName: `Headers-Policy-${stage}`,
      comment: "Add Security Headers",
      securityHeadersBehavior: {
        contentTypeOptions: {
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.days(730),
          includeSubdomains: true,
          preload: true,
          override: true,
        },
        frameOptions: {
          frameOption: cloudfront.HeadersFrameOption.DENY,
          override: true,
        },
        contentSecurityPolicy: {
          contentSecurityPolicy:
            "default-src 'self'; img-src 'self' data: https://www.google-analytics.com; script-src 'self' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com tags.tiqcdn.com tags.tiqcdn.cn tags-eu.tiqcdn.com tealium-tags.cms.gov dap.digitalgov.gov https://*.adoberesources.net 'unsafe-inline'; style-src 'self' maxcdn.bootstrapcdn.com fonts.googleapis.com 'unsafe-inline'; font-src 'self' maxcdn.bootstrapcdn.com fonts.gstatic.com; connect-src https://*.amazonaws.com/ https://*.amazoncognito.com https://www.google-analytics.com https://*.launchdarkly.us https://adobe-ep.cms.gov https://adobedc.demdex.net; frame-ancestors 'none'; object-src 'none'",
          override: true,
        },
      },
    }
  );
  securityHeadersPolicy.applyRemovalPolicy(
    isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN
  )

  const distribution = new cloudfront.Distribution(
    scope,
    "CloudFrontDistribution",
    {
      certificate: cloudfrontCertificateArn
        ? acm.Certificate.fromCertificateArn(
            scope,
            "certArn",
            cloudfrontCertificateArn
          )
        : undefined,
      domainNames: cloudfrontDomainName
        ? [cloudfrontDomainName]
        : [],
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
          uiBucket
        ),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        responseHeadersPolicy: securityHeadersPolicy,
      },
      defaultRootObject: "index.html",
      enableLogging: true,
      logBucket: logBucket,
      httpVersion: cloudfront.HttpVersion.HTTP2,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    }
  );
  distribution.applyRemovalPolicy(
    isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN
  );

  const applicationEndpointUrl = `https://${distribution.distributionDomainName}/`;

  setupWaf(scope, stage, project, vpnIpSetArn, vpnIpv6SetArn);

  createFirehoseLogging(
    scope,
    stage,
    project,
    logBucket,
    iamPermissionsBoundary,
    iamPath
  );

  addIamPropertiesToBucketAutoDeleteRole(
    scope,
    iamPermissionsBoundary.managedPolicyArn,
    iamPath
  );

  return {
    cloudfrontDistributionId: distribution.distributionId,
    distribution,
    applicationEndpointUrl,
    s3BucketName: uiBucket.bucketName,
    uiBucket,
  };
}

function setupWaf(
  scope: Construct,
  stage: string,
  project: string,
  vpnIpSetArn: string,
  vpnIpv6SetArn: string,
) {
  const wafRules: wafv2.CfnWebACL.RuleProperty[] = [];

  const defaultAction = vpnIpSetArn
    ? { block: {} }
    : { allow: {} };

  if (vpnIpSetArn) {
    const githubIpSet = new wafv2.CfnIPSet(scope, "GitHubIPSet", {
      name: `${stage}-gh-ipset`,
      scope: "CLOUDFRONT",
      addresses: [],
      ipAddressVersion: "IPV4",
    });

    const statements = [
      {
        ipSetReferenceStatement: { arn: vpnIpSetArn },
      },
      {
        ipSetReferenceStatement: { arn: githubIpSet.attrArn },
      },
    ];

    if (vpnIpv6SetArn) {
      statements.push({
        ipSetReferenceStatement: {
          arn: vpnIpv6SetArn,
        },
      });
    }

    wafRules.push({
      name: "vpn-only",
      priority: 0,
      action: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${project}-${stage}-webacl-vpn-only`,
        sampledRequestsEnabled: true,
      },
      statement: {
        orStatement: {
          statements,
        },
      },
    });
  }

  new wafv2.CfnWebACL(scope, "WebACL", {
    name: `${project}-${stage}-webacl-waf`,
    scope: "CLOUDFRONT",
    defaultAction,
    visibilityConfig: {
      sampledRequestsEnabled: true,
      cloudWatchMetricsEnabled: true,
      metricName: `${project}-${stage}-webacl`,
    },
    rules: wafRules,
  });
}

function createFirehoseLogging(
  scope: Construct,
  stage: string,
  project: string,
  logBucket: s3.Bucket,
  iamPermissionsBoundary: IManagedPolicy,
  iamPath: string
) {
  const firehoseRole = new iam.Role(scope, "FirehoseRole", {
    permissionsBoundary: iamPermissionsBoundary,
    path: iamPath,
    assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
    inlinePolicies: {
      FirehoseS3Access: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ["s3:PutObject"],
            resources: [`${logBucket.bucketArn}/*`],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    },
  });

  new firehose.CfnDeliveryStream(scope, "Firehose", {
    deliveryStreamName: `aws-waf-logs-${project}-${stage}-firehose`,
    extendedS3DestinationConfiguration: {
      roleArn: firehoseRole.roleArn,
      bucketArn: logBucket.bucketArn,
      prefix: `AWSLogs/WAF/${stage}/`,
      bufferingHints: {
        intervalInSeconds: 300,
        sizeInMBs: 5,
      },
      compressionFormat: "UNCOMPRESSED",
    },
  });
}
