import { Construct } from "constructs";
import {
  aws_cloudfront as cloudfront,
  // aws_cloudfront_origins as cloudfrontOrigins,
  aws_iam as iam,
  aws_kinesisfirehose as firehose,
  aws_s3 as s3,
  aws_wafv2 as wafv2,
  Aws,
  Duration,
  RemovalPolicy,
  // aws_certificatemanager as acm,
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
  deploymentConfigParameters: { [name: string]: string | undefined };
}

export function createUiComponents(props: CreateUiComponentsProps) {
  const {
    scope,
    stage,
    project,
    isDev,
    iamPermissionsBoundary,
    iamPath,
    deploymentConfigParameters,
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

  // const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
  new cloudfront.ResponseHeadersPolicy(
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

  // HERE
  // new cloudfront.Distribution(scope, 'myCdn', {
  //   defaultBehavior: {
  //     origin: new cloudfrontOrigins.HttpOrigin('www.example.com'),
  //   },
  // });

  // const dummyBucket = new s3.Bucket(scope, "DummyBucket", {
  //   encryption: s3.BucketEncryption.S3_MANAGED,
  //   // removalPolicy: RemovalPolicy.DESTROY,
  //   // autoDeleteObjects: true,
  //   // enforceSSL: true,
  // });

  // # CloudFrontOriginAccessIdentity:
  // #   Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
  // #   DeletionPolicy: Retain
  // #   Properties:
  // #     CloudFrontOriginAccessIdentityConfig:
  // #       Comment: OAI to prevent direct public access to the bucket

  // const CloudFrontOriginAccessIdentity =
  // new cloudfront.CfnCloudFrontOriginAccessIdentity(
  //   scope, 'CloudFrontOriginAccessIdentity', {
  //   cloudFrontOriginAccessIdentityConfig: {
  //     comment: 'OAI to prevent direct public access to the bucket',
  //   },
  // });

  // new cloudfront.Distribution(scope, "HelloWorldDistribution", {
  //   defaultBehavior: {
  //     origin: new cloudfrontOrigins.HttpOrigin("example.com"),
  //     functionAssociations: [
  //       {
  //         function: new cloudfront.Function(scope, "HelloWorldFunction", {
  //           code: cloudfront.FunctionCode.fromInline(`
  //                 function handler(event) {
  //                   var response = {
  //                     statusCode: 200,
  //                     statusDescription: 'OK',
  //                     headers: {
  //                       'content-type': { value: 'text/html; charset=utf-8' },
  //                     },
  //                     body: '<h1>Hello World</h1>',
  //                   };
  //                   return response;
  //                 }
  //               `),
  //         }),
  //         eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
  //       },
  //     ],
  //     viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  //   },
  // });

  // const distribution = new cloudfront.Distribution(
  //   scope,
  //   "CloudFrontDistribution",
  //   {
  //     // certificate: deploymentConfigParameters.cloudfrontCertificateArn
  //     //   ? acm.Certificate.fromCertificateArn(
  //     //       scope,
  //     //       "certArn",
  //     //       deploymentConfigParameters.cloudfrontCertificateArn
  //     //     )
  //     //   : undefined,
  //     // domainNames: deploymentConfigParameters.cloudfrontDomainName
  //       // ? [deploymentConfigParameters.cloudfrontDomainName]
  //       // : [],
  //     domainNames: ['ui-cmdct-4184-sls-dummybucket-zss2xed1ezsv.s3-website-us-east-1.amazonaws.com'],
  //     defaultBehavior: {
  //       origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
  //         dummyBucket
  //       ),
  //       // allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
  //       // viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  //       // cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
  //       // compress: true,
  //       // responseHeadersPolicy: securityHeadersPolicy,
  //     },
  //     defaultRootObject: "index.html",
  //     // enableLogging: true,
  //     // logBucket: loggingBucket,
  //     httpVersion: cloudfront.HttpVersion.HTTP2,
  //     // errorResponses: [
  //     //   {
  //     //     httpStatus: 403,
  //     //     responseHttpStatus: 200,
  //     //     responsePagePath: "/index.html",
  //     //   },
  //     // ],
  //   }
  // );

  // const applicationEndpointUrl = `https://${distribution.distributionDomainName}/`;

  setupWaf(scope, stage, project, deploymentConfigParameters);

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
    // cloudfrontDistributionId: distribution.distributionId,
    // distribution,
    // applicationEndpointUrl,
    s3BucketName: uiBucket.bucketName,
    uiBucket,
  };
}

function setupWaf(
  scope: Construct,
  stage: string,
  project: string,
  deploymentConfigParameter: { [name: string]: string | undefined }
) {
  const wafRules: wafv2.CfnWebACL.RuleProperty[] = [];

  const defaultAction = deploymentConfigParameter.vpnIpSetArn
    ? { block: {} }
    : { allow: {} };

  if (deploymentConfigParameter.vpnIpSetArn) {
    const githubIpSet = new wafv2.CfnIPSet(scope, "GitHubIPSet", {
      name: `${stage}-gh-ipset`,
      scope: "CLOUDFRONT",
      addresses: [],
      ipAddressVersion: "IPV4",
    });

    const statements = [
      {
        ipSetReferenceStatement: { arn: deploymentConfigParameter.vpnIpSetArn },
      },
      {
        ipSetReferenceStatement: { arn: githubIpSet.attrArn },
      },
    ];

    if (deploymentConfigParameter.vpnIpv6SetArn) {
      statements.push({
        ipSetReferenceStatement: {
          arn: deploymentConfigParameter.vpnIpv6SetArn,
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
            resources: [`${loggingBucket.bucketArn}/*`],
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
