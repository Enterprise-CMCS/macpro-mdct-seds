import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_s3 as s3,
  aws_iam as iam,
  // aws_route53 as route53,
  // aws_route53_targets as route53Targets,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfrontOrigins,
  aws_ssm as ssm,
  aws_wafv2 as wafv2,
  aws_kinesisfirehose as firehose,
} from "aws-cdk-lib";

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
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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

    // CloudFront OAI
    // const oai = new cloudfront.OriginAccessIdentity(this, "CloudFrontOAI");

    // CloudFront distribution
    const cloudFrontDistribution = new cloudfront.Distribution(
      this,
      "CloudFrontDistribution",
      {
        defaultBehavior: {
          origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(
            s3Bucket
          ),
          // new cloudfrontOrigins.S3BucketOrigin(s3Bucket, {
          //   originAccessIdentity: oai,
          // }),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        defaultRootObject: "index.html",
        enableLogging: true,
        logBucket: loggingBucket,
      }
    );

    const vpnIpSetArn = safeGetSsmParameter(this, [
      `/configuration/${props.stage}/vpnIpSetArn`,
      `/configuration/default/vpnIpSetArn`,
    ]);

    const wafRules: cdk.aws_wafv2.CfnWebACL.RuleProperty[] = [];

    if (vpnIpSetArn) {
      wafRules.push({
        name: "block-all-other-traffic",
        priority: 1,
        action: { block: {} },
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
    // const wafAcl =
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

    // // Route 53 DNS Record
    // const hostedZoneId = ssm.StringParameter.valueFromLookup(
    //   this,
    //   `/configuration/${props.stage}/route53/hostedZoneId`
    // );
    // const domainName = ssm.StringParameter.valueFromLookup(
    //   this,
    //   `/configuration/${props.stage}/route53/domainName`
    // );

    // if (hostedZoneId && domainName) {
    //   const zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
    //     hostedZoneId,
    //     zoneName: domainName,
    //   });

    //   new route53.ARecord(this, "AliasRecord", {
    //     zone,
    //     target: route53.RecordTarget.fromAlias(
    //       new route53Targets.CloudFrontTarget(cloudFrontDistribution)
    //     ),
    //   });
    // }

    // Output the bucket name and CloudFront URL
    new cdk.CfnOutput(this, "S3BucketName", { value: s3Bucket.bucketName });
    new cdk.CfnOutput(this, "CloudFrontUrl", {
      value: cloudFrontDistribution.distributionDomainName,
    });
  }
}

function safeGetSsmParameter(
  scope: Construct,
  paramPaths: string[]
): string | undefined {
  for (const paramPath of paramPaths) {
    try {
      const param = ssm.StringParameter.fromStringParameterAttributes(
        scope,
        `Parameter-${paramPath}`,
        {
          parameterName: paramPath,
          simpleName: false,
        }
      );
      return param.stringValue;
    } catch (e) {
      console.warn(`SSM parameter ${paramPath} not found, trying next...`);
    }
  }
  console.warn("No valid SSM parameters found for VPN IP Set.");
  return undefined;
}
