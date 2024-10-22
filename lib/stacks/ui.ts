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
import { getParameter } from "../utils/ssm";

interface UiStackProps extends cdk.NestedStackProps {
  stack: string;
  project: string;
  stage: string;
  restrictToVpn: boolean;
}

export class UiStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UiStackProps) {
    super(scope, id, props);

    // const stage = this.node.tryGetContext("stage") || "dev";

    // S3 Bucket for UI hosting
    const s3Bucket = new s3.Bucket(this, "S3Bucket", {
      // websiteIndexDocument: "index.html",
      // websiteErrorDocument: "index.html",
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Logging bucket
    const loggingBucket = new s3.Bucket(this, "LoggingBucket", {
      bucketName: `${props.project}-${props.stage}-cloudfront-logs-${this.account}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // autoDeleteObjects: isDev, // TODO: add isDev to this stack.
    });

    // Deny insecure requests to the bucket
    loggingBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:*"],
        resources: [loggingBucket.bucketArn, `${loggingBucket.bucketArn}/*`],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      })
    );

    // Add bucket policy to allow CloudFront to write logs
    loggingBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [`${loggingBucket.bucketArn}/*`],
      })
    );

    // CloudFront distribution
    const cloudFrontDistribution = new cloudfront.Distribution(
      this,
      "CloudFrontDistribution",
      {
        defaultBehavior: {
          origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
            s3Bucket
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

    new cloudfront.ResponseHeadersPolicy(this, "CloudFormationHeadersPolicy", {
      responseHeadersPolicyName: `Headers-Policy-cdk-${this.node.tryGetContext(
        "stage"
      )}`,
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

    (async () => {
      const vpnIpSetArn = await (async () => {
        const vpnIpSetPaths = [
          `/configuration/${props.stage}/vpnIpSetArn`,
          `/configuration/default/vpnIpSetArn`,
        ];

        for (const paramPath of vpnIpSetPaths) {
          try {
            const paramValue = await getParameter(paramPath);
            return paramValue;
          } catch (error) {
            if (
              (error as Error).message.includes("Failed to fetch parameter")
            ) {
              console.warn(
                'Ignoring "Failed to fetch parameter" error:',
                (error as Error).message
              );
            } else {
              throw error;
            }
          }
        }

        return undefined;
      })();

      const wafRules: cdk.aws_wafv2.CfnWebACL.RuleProperty[] = [];

      if (vpnIpSetArn) {
        const githubIpSet = new wafv2.CfnIPSet(this, "GitHubIPSet", {
          name: `${this.node.tryGetContext("stage")}-cdk-gh-ipset`,
          scope: "CLOUDFRONT",
          addresses: [],
          ipAddressVersion: "IPV4",
        });

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
              statements: [
                {
                  ipSetReferenceStatement: {
                    arn: vpnIpSetArn,
                  },
                },
                {
                  ipSetReferenceStatement: {
                    arn: githubIpSet.attrArn,
                  },
                },
              ],
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
                ipSetReferenceStatement: {
                  arn: vpnIpSetArn,
                },
              },
            },
          },
        });
      }

      // Web ACL for CloudFront
      new wafv2.CfnWebACL(this, "WebACL", {
        name: `${props.project}-${props.stage}-webacl-waf`,
        scope: "CLOUDFRONT",
        defaultAction: {
          allow: {},
        },
        visibilityConfig: {
          sampledRequestsEnabled: true,
          cloudWatchMetricsEnabled: true,
          metricName: `${props.project}-${props.stage}-webacl`,
        },
        rules: wafRules,
      });
    })();

    // Firehose for WAF logging
    const firehoseRole = new iam.Role(this, "FirehoseRole", {
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

    (async () => {
      // Route 53 DNS Record
      try {
        const hostedZoneId = await getParameter(
          `/configuration/${props.stage}/route53/hostedZoneId`
        );
        const domainName = await getParameter(
          `/configuration/${props.stage}/route53/domainName`
        );

        if (hostedZoneId && domainName) {
          const zone = route53.HostedZone.fromHostedZoneAttributes(
            this,
            "Zone",
            {
              hostedZoneId,
              zoneName: domainName,
            }
          );

          new route53.ARecord(this, "AliasRecord", {
            zone,
            target: route53.RecordTarget.fromAlias(
              new route53Targets.CloudFrontTarget(cloudFrontDistribution)
            ),
          });
        }
      } catch (error) {
        if ((error as Error).message.includes("Failed to fetch parameter")) {
          console.warn(
            'Ignoring "Failed to fetch parameter" error:',
            (error as Error).message
          );
        } else {
          throw error;
        }
      }
    })();

    // Output the bucket name and CloudFront URL
    new cdk.CfnOutput(this, "S3BucketName", { value: s3Bucket.bucketName });
    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: cloudFrontDistribution.distributionDomainName,
    });
  }
}
