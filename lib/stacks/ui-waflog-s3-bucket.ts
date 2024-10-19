import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

interface UiWafLogS3BucketStackProps extends cdk.NestedStackProps {
  project: string;
  stage: string;
  stack: string;
}

export class UiWafLogS3BucketStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UiWafLogS3BucketStackProps) {
    super(scope, id, props);

    // const stage = this.node.tryGetContext("stage") || "dev";

    // S3 Bucket
    const waflogsBucket = new s3.Bucket(this, "WaflogsUploadBucket", {
      bucketName: `${cdk.Aws.ACCOUNT_ID}-${props.stage}-waflogs`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    // Bucket Policy to deny non-SSL requests
    waflogsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "AllowSSLRequestsOnly",
        effect: iam.Effect.DENY,
        actions: ["s3:*"],
        resources: [
          waflogsBucket.bucketArn,



          waflogsBucket.arnForObjects("*"),
        ],
        principals: [new iam.AnyPrincipal()],
        conditions: {
          Bool: { "aws:SecureTransport": "false" },
        },
      })
    );

    // Output the ARN of the S3 bucket
    new cdk.CfnOutput(this, "WaflogsUploadBucketArn", {
      value: waflogsBucket.bucketArn,
    });
  }
}
