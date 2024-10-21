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



    // Cognito User Pool
    new cognito.UserPool(this, "UserPool", {
      userPoolName: `${stage}-user-pool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoVerify: {
        email: true,
      },
      signInAliases: { email: true },
      standardAttributes: {
        given_name: {
          required: false,
          mutable: true,
        },
        family_name: {
          required: false,
          mutable: true,
        },
        phone_number: {
          required: false,
          mutable: true,
        },
        ismemberof: {
          required: false,
          mutable: true,
        },
      },
    });
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
