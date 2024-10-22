import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
  aws_cognito as cognito,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface UiAuthStackProps extends cdk.NestedStackProps {
  stack: string;
}

export class UiAuthStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: UiAuthStackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage") || "dev";


    // Cognito User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `${stage}-user-pool`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      selfSignUpEnabled: false,
      standardAttributes: {
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        ismemberof: new cognito.StringAttribute({ mutable: true }),
      },
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
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

    lambdaApiRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: [userPool.userPoolArn],
      })
    );

    // Cognito User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPoolClientName: `${stage}-user-pool-client`,
      userPool,
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          // TODO: applicationEndpointUrl,
          "https://localhost:3000/",
        ],
        logoutUrls: [
          // TODO: applicationEndpointUrl,
          "https://localhost:3000/",
        ],
      },
      generateSecret: false,
    });

    new cdk.CfnOutput(this, "Troubleshooting", {
      value: `${stage}-login-${userPoolClient}`,
    });

  }
}
