import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cr from "aws-cdk-lib/custom-resources";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

export function getTableStreamArn(
  scope: Construct,
  tableName: string,
  iamPermissionsBoundary: IManagedPolicy,
  iamPath: string
): string {
  return new cr.AwsCustomResource(scope, `${tableName}StreamArnLookup`, {
    role: new cdk.aws_iam.Role(scope, `${tableName}StreamArnLookupRole`, {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        StreamArnLookup: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              actions: ["dynamodb:DescribeTable"],
              resources: [
                `arn:aws:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${tableName}`,
              ],
              effect: cdk.aws_iam.Effect.ALLOW,
            }),
          ],
        }),
      },
      permissionsBoundary: iamPermissionsBoundary,
      path: iamPath,
    }),
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
