import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_s3 as s3,
  aws_iam as iam,
  aws_route53 as route53,
  aws_route53_targets as route53Targets,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfrontOrigins,
  aws_wafv2 as wafv2,
  aws_kinesisfirehose as firehose,
} from "aws-cdk-lib";
import { getDeploymentConfigParameter } from "../utils/systems-manager";
import { addIamPropertiesToBucketAutoDeleteRole } from "../utils/s3";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface UiStackProps extends cdk.NestedStackProps {
  isDev: boolean;
  stack: string;
  project: string;
  stage: string;
  restrictToVpn: boolean;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
}

export class UiStack extends cdk.NestedStack {
  public readonly distribution: cloudfront.Distribution;
  public readonly applicationEndpointUrl: string;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: UiStackProps) {
    super(scope, id, props);

    // S3 Bucket for UI hosting
    this.bucket = new s3.Bucket(this, "S3Bucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    const loggingBucket = new s3.Bucket(this, "LoggingBucket", {
      bucketName: `${props.project}-${props.stage}-cloudfront-logs-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.isDev,
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

    this.distribution = new cloudfront.Distribution(
      this,
      "CloudFrontDistribution",
      {
        defaultBehavior: {
          origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
            this.bucket
          ),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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

    this.applicationEndpointUrl = `https://${this.distribution.distributionDomainName}/`;

    new cloudfront.ResponseHeadersPolicy(this, "CloudFormationHeadersPolicy", {
      responseHeadersPolicyName: `Headers-Policy-${props.stage}`,
      comment: "Add Security Headers",
      securityHeadersBehavior: {
        contentTypeOptions: {
          override: true,
        },
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(730),
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

    this.setupWaf(props);
    this.setupRoute53(props, this.distribution);

    this.createFirehoseLogging(props, loggingBucket);
  }

  private async setupWaf(props: UiStackProps) {
    const vpnIpSetArn = await getDeploymentConfigParameter(
      "vpnIpSetArn",
      props.stage
    );
    const vpnIpv6SetArn = await getDeploymentConfigParameter(
      "vpnIpv6SetArn",
      props.stage
    );
    const wafRules: wafv2.CfnWebACL.RuleProperty[] = [];

    if (vpnIpSetArn) {
      const githubIpSet = new wafv2.CfnIPSet(this, "GitHubIPSet", {
        name: `${props.stage}-gh-ipset`,
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
          metricName: `${props.project}-${props.stage}-webacl-vpn-only`,
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
          metricName: `${props.project}-${props.stage}-block-traffic`,
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

    new wafv2.CfnWebACL(this, "WebACL", {
      name: `${props.project}-${props.stage}-webacl-waf`,
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: `${props.project}-${props.stage}-webacl`,
      },
      rules: wafRules,
    });
  }

  private async setupRoute53(
    props: UiStackProps,
    distribution: cloudfront.Distribution
  ) {
    const hostedZoneId = await getDeploymentConfigParameter(
      "route53/hostedZoneId",
      props.stage
    );
    const domainName = await getDeploymentConfigParameter(
      "route53/domainName",
      props.stage
    );

    if (hostedZoneId && domainName) {
      const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
        hostedZoneId,
        zoneName: domainName,
      });

      new route53.ARecord(this, "AliasRecord", {
        zone,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(distribution)
        ),
      });
    }
  }

  private createFirehoseLogging(props: UiStackProps, loggingBucket: s3.Bucket) {
    const firehoseRole = new iam.Role(this, "FirehoseRole", {
      permissionsBoundary: props.iamPermissionsBoundary,
      path: props.iamPath,
      assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
      inlinePolicies: {
        FirehoseS3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["s3:PutObject"],
              resources: [
                `arn:aws:s3:::${props.project}-${props.stage}-cloudfront-logs-${this.account}/*`,
              ],
              effect: iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    new firehose.CfnDeliveryStream(this, "Firehose", {
      deliveryStreamName: `aws-waf-logs-${props.project}-${props.stage}-firehose`,
      extendedS3DestinationConfiguration: {
        roleArn: firehoseRole.roleArn,
        bucketArn: loggingBucket.bucketArn,
        prefix: `AWSLogs/WAF/${props.stage}/`,
        bufferingHints: {
          intervalInSeconds: 300,
          sizeInMBs: 5,
        },
        compressionFormat: "UNCOMPRESSED",
      },
    });

    addIamPropertiesToBucketAutoDeleteRole(
      this,
      props.iamPermissionsBoundary.managedPolicyArn,
      props.iamPath
    );
  }
}
