import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cr from "aws-cdk-lib/custom-resources";

export function getTableStreamArn(scope: Construct, tableName: string): string {
  return new cr.AwsCustomResource(scope, `${tableName}StreamArnLookup`, {
    onCreate: {
      service: "DynamoDB",
      action: "describeTable",
      parameters: {
        TableName: tableName,
      },
      physicalResourceId: cr.PhysicalResourceId.of(tableName),
    },
    policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
      resources: [
        `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${tableName}`,
      ],
    }),
  }).getResponseField("Table.LatestStreamArn");
}
