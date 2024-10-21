import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

interface UiSrcStackProps extends cdk.NestedStackProps {
  stack: string;
}

export class UiSrcStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UiSrcStackProps) {
    super(scope, id, props);

    // const stage = this.node.tryGetContext("stage") || "dev";

    // Define S3 bucket for UI hosting
    // const uiBucket =
    new s3.Bucket(this, "UiBucket", {
      // bucketName: props.s3BucketName,
      // websiteIndexDocument: "index.html",
      // websiteErrorDocument: "index.html",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

  }
}
