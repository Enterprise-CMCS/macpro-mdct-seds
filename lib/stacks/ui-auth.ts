import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface UiAuthStackProps extends cdk.NestedStackProps {
  stack: string;
}

export class UiAuthStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UiAuthStackProps) {
    super(scope, id, props);



    // IAM Role for Lambda
    const lambdaApiRole = new iam.Role(this, "LambdaApiRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
    });

    lambdaApiRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["arn:aws:logs:*:*:*"],
      })
    );

  }
}
