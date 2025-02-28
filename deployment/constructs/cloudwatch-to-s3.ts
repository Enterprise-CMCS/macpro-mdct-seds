import { Construct } from "constructs";
import {
  aws_iam as iam,
  aws_kinesisfirehose as kinesisfirehose,
  aws_logs as logs,
  aws_s3 as s3,
  Aws,
  Fn,
  RemovalPolicy,
} from "aws-cdk-lib";

interface CloudWatchToS3Props {
  readonly logGroup: logs.LogGroup;
  readonly bucket: s3.Bucket;
  readonly filePrefix?: string;
  readonly filterPattern?: string;
  iamPermissionsBoundary: iam.IManagedPolicy;
  iamPath: string;
}

export class CloudWatchToS3 extends Construct {
  public readonly deliveryStream: kinesisfirehose.CfnDeliveryStream;

  constructor(scope: Construct, id: string, props: CloudWatchToS3Props) {
    super(scope, id);

    const { logGroup, bucket, filePrefix = "", filterPattern = "" } = props;

    // Create a Firehose role
    const firehoseRole = new iam.Role(this, "FirehoseRole", {
      assumedBy: new iam.ServicePrincipal("firehose.amazonaws.com"),
      permissionsBoundary: props.iamPermissionsBoundary,
      path: props.iamPath,
    });

    firehoseRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:PutObject", "s3:PutObjectAcl"],
        resources: [`${bucket.bucketArn}/*`],
      })
    );

    firehoseRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["logs:PutLogEvents"],
        resources: [
          `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/kinesisfirehose/*`,
        ],
      })
    );

    // Create a CloudWatch Log Group for Firehose logging
    const firehoseLogGroup = new logs.LogGroup(this, "FirehoseLogGroup", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Create a Kinesis Firehose delivery stream
    this.deliveryStream = new kinesisfirehose.CfnDeliveryStream(
      this,
      "DeliveryStream",
      {
        deliveryStreamType: "DirectPut",
        extendedS3DestinationConfiguration: {
          bucketArn: bucket.bucketArn,
          roleArn: firehoseRole.roleArn,
          prefix: filePrefix,
          cloudWatchLoggingOptions: {
            enabled: true,
            logGroupName: firehoseLogGroup.logGroupName,
            logStreamName: `firehose-to-s3-log-stream`,
          },
        },
      }
    );

    const subscriptionFilterRole = new iam.Role(
      this,
      "SubscriptionFilterRole",
      {
        assumedBy: new iam.ServicePrincipal("logs.amazonaws.com"),
        permissionsBoundary: props.iamPermissionsBoundary,
        path: props.iamPath,
        inlinePolicies: {
          PutRecordPolicy: new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                actions: ["firehose:PutRecord", "firehose:PutRecordBatch"],
                resources: [
                  Fn.getAtt(this.deliveryStream.logicalId, "Arn").toString(),
                ],
              }),
            ],
          }),
        },
      }
    );

    // Create a subscription filter to send logs from the CloudWatch Log Group to Firehose
    new logs.CfnSubscriptionFilter(this, "SubscriptionFilter", {
      logGroupName: logGroup.logGroupName,
      filterPattern: filterPattern,
      destinationArn: Fn.getAtt(
        this.deliveryStream.logicalId,
        "Arn"
      ).toString(),
      roleArn: subscriptionFilterRole.roleArn,
    });
  }
}
