import { Construct } from "constructs";
import {
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfrontOrigins,
  aws_iam as iam,
  aws_kinesisfirehose as firehose,
  aws_route53 as route53,
  aws_route53_targets as route53Targets,
  aws_s3 as s3,
  aws_wafv2 as wafv2,
  Aws,
  Duration,
  RemovalPolicy,
} from "aws-cdk-lib";
import { getDeploymentConfigParameter } from "../utils/systems-manager";
import { addIamPropertiesToBucketAutoDeleteRole } from "../utils/s3";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface CreateUiComponentsProps {
  scope: Construct;
  stage: string;
  project: string;
  isDev: boolean;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
}

export function createUiComponents(props: CreateUiComponentsProps) {
  const {
    scope,
    stage,
    project,
    isDev,
    iamPermissionsBoundary,
    iamPath,
  } = props;
  // S3 Bucket for UI hosting
  const uiBucket = new s3.Bucket(scope, "uiBucket", {
    encryption: s3.BucketEncryption.S3_MANAGED,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    enforceSSL: true,
  });

  const loggingBucket = new s3.Bucket(scope, "LoggingBucket", {
    bucketName: `${project}-${stage}-cloudfront-logs-${Aws.ACCOUNT_ID}`,
    versioned: true,
    encryption: s3.BucketEncryption.S3_MANAGED,
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: isDev,
    enforceSSL: true,
  });

  // Add bucket policy to allow CloudFront to write logs
  loggingBucket.addToResourcePolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
      actions: ["s3:PutObject"],
      resources: [`${loggingBucket.bucketArn}/*`],
    })
  );

  const distribution = new cloudfront.Distribution(
    scope,
    "CloudFrontDistribution",
    {
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
          uiBucket
        ),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: "index.html",
      enableLogging: true,
      logBucket: loggingBucket,
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

  const applicationEndpointUrl = `https://${distribution.distributionDomainName}/`;

  new cloudfront.ResponseHeadersPolicy(scope, "CloudFormationHeadersPolicy", {
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
  });

  setupWaf(scope, stage, project);
  setupRoute53(scope, stage, distribution);

  createFirehoseLogging(
    scope,
    stage,
    project,
    loggingBucket,
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
    applicationEndpointUrl,
    s3BucketName: uiBucket.bucketName,
  };
}

async function setupWaf(scope: Construct, stage: string, project: string) {
  const vpnIpSetArn = await getDeploymentConfigParameter("vpnIpSetArn", stage);
  const vpnIpv6SetArn = await getDeploymentConfigParameter(
    "vpnIpv6SetArn",
    stage
  );
  const wafRules: wafv2.CfnWebACL.RuleProperty[] = [];

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
        ipSetReferenceStatement: { arn: vpnIpv6SetArn },
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

    wafRules.push({
      name: "block-all-other-traffic",
      priority: 3,
      action: { block: { customResponse: { responseCode: 403 } } },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${project}-${stage}-block-traffic`,
        sampledRequestsEnabled: true,
      },
      statement: {
        notStatement: {
          statement: {
            ipSetReferenceStatement: { arn: vpnIpSetArn },
          },
        },
      },
    });
  }

  new wafv2.CfnWebACL(scope, "WebACL", {
    name: `${project}-${stage}-webacl-waf`,
    scope: "CLOUDFRONT",
    defaultAction: { allow: {} },
    visibilityConfig: {
      sampledRequestsEnabled: true,
      cloudWatchMetricsEnabled: true,
      metricName: `${project}-${stage}-webacl`,
    },
    rules: wafRules,
  });
}

async function setupRoute53(
  scope: Construct,
  stage: string,
  distribution: cloudfront.Distribution
) {
  const hostedZoneId = await getDeploymentConfigParameter(
    "route53/hostedZoneId",
    stage
  );
  const domainName = await getDeploymentConfigParameter(
    "route53/domainName",
    stage
  );

  if (hostedZoneId && domainName) {
    const zone = route53.HostedZone.fromHostedZoneAttributes(scope, "Zone", {
      hostedZoneId,
      zoneName: domainName,
    });

    new route53.ARecord(scope, "AliasRecord", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });
  }
}

function createFirehoseLogging(
  scope: Construct,
  stage: string,
  project: string,
  loggingBucket: s3.Bucket,
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
            resources: [
              `arn:aws:s3:::${project}-${stage}-cloudfront-logs-${Aws.ACCOUNT_ID}/*`,
            ],
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
      bucketArn: loggingBucket.bucketArn,
      prefix: `AWSLogs/WAF/${stage}/`,
      bufferingHints: {
        intervalInSeconds: 300,
        sizeInMBs: 5,
      },
      compressionFormat: "UNCOMPRESSED",
    },
  });
}
