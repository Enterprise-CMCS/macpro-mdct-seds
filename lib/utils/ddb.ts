import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cr from "aws-cdk-lib/custom-resources";

export function getTableStreamArn(
  scope: Construct,
  table: cdk.aws_dynamodb.Table
): string {
  return new cr.AwsCustomResource(scope, "StreamArnLookup", {
    onCreate: {
      service: "DynamoDB",
      action: "describeTable",
      parameters: {
        TableName: table.tableArn,
      },
      physicalResourceId: cr.PhysicalResourceId.of(table.tableArn),
    },
    policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
      resources: [table.tableArn],
    }),
  }).getResponseField("Table.LatestStreamArn");
}
