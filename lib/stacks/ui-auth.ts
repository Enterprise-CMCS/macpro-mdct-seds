import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
  aws_cognito as cognito,
  aws_ssm as ssm,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { getParameter } from "../utils/ssm";
import { WafConstruct } from "../local-constructs/waf";

interface UiAuthStackProps extends cdk.NestedStackProps {
  stack: string;
  api: cdk.aws_apigateway.RestApi;
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

    // back with okta
    let backWithOkta = false;
    let idp = undefined;
    async () => {
      const oktaMetadataUrl = await getOktaMetadataUrl(stage);

      if (oktaMetadataUrl) {
        backWithOkta = true;
      }

      if (backWithOkta) {
        idp = new cognito.CfnUserPoolIdentityProvider(
          this,
          "CognitoUserPoolIdentityProvider",
          {
            providerName: "Okta",
            providerType: "SAML",
            userPoolId: userPool.userPoolId,
            providerDetails: {
              MetadataURL:
                "https://test.idp.idm.cms.gov/app/exk6nytt8hbVUKGOg297/sso/saml/metadata", // TODO: oktaMetadataUrl
            },
            attributeMapping: {
              email:
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
              family_name:
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
              given_name:
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
              "custom:ismemberof": "ismemberof",
            },
            idpIdentifiers: ["IdpIdentifier"],
          }
        );
      }
    };

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
      supportedIdentityProviders:
        backWithOkta && idp
          ? [(idp as unknown) as cognito.UserPoolClientIdentityProvider]
          : undefined,
      generateSecret: false,
    });

    const userPoolDomain = new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool,
      cognitoDomain: { domainPrefix: `${stage}-login-user-pool-client` },
    });

    // Cognito Identity Pool
    const identityPool = new cognito.CfnIdentityPool(
      this,
      "CognitoIdentityPool",
      {
        identityPoolName: `${stage}IdentityPool`,
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: userPool.userPoolProviderName,
          },
        ],
      }
    );

    // IAM Role for Cognito Authenticated Users
    const cognitoAuthRole = new iam.Role(this, "CognitoAuthRole", {
      assumedBy: new cdk.aws_iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
      inlinePolicies: {
        CognitoAuthorizedPolicy: new cdk.aws_iam.PolicyDocument({
          statements: [
            new cdk.aws_iam.PolicyStatement({
              actions: [
                "mobileanalytics:PutEvents",
                "cognito-sync:*",
                "cognito-identity:*",
              ],
              resources: ["*"],
              effect: cdk.aws_iam.Effect.ALLOW,
            }),
            new cdk.aws_iam.PolicyStatement({
              actions: ["execute-api:Invoke"],
              resources: [
                `arn:aws:execute-api:${this.region}:${this.account}:${props.api.restApiId}/*`,
              ],
              effect: cdk.aws_iam.Effect.ALLOW,
            }),
          ],
        }),
      },
    });

    new cdk.aws_cognito.CfnIdentityPoolRoleAttachment(
      this,
      "CognitoIdentityPoolRoles",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: cognitoAuthRole.roleArn },
      }
    );

    new ssm.StringParameter(this, "CognitoUserPoolIdParameter", {
      parameterName: `/${stage}/ui-auth/cdk_cognito_user_pool_id`,
      stringValue: userPool.userPoolId,
    });
    new ssm.StringParameter(this, "CognitoUserPoolClientIdParameter", {
      parameterName: `/${stage}/ui-auth/cdk_cognito_user_pool_client_id`,
      stringValue: userPoolClient.userPoolClientId,
    });

    // Lambda function: bootstrapUsers
    new lambda_nodejs.NodejsFunction(this, "bootstrapUsers", {
      entry: "services/ui-auth/handlers/createUsers.js",
      handler: "handlers.handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(60),
      role: lambdaApiRole,
      environment: {
        userPoolId: userPool.userPoolId,
        bootstrapUsersPassword: process.env.BOOTSTRAP_USERS_PASSWORD || "",
      },
    });


    new WafConstruct(
      this,
      "WafConstruct",
      {
        name: `ui-auth-${stage}-webacl-waf`,
        // apiGateway: this.api,
      },
      "cognito"
    );

    // Outputs
    new cdk.CfnOutput(this, "UserPoolIdOutput", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientIdOutput", {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "UserPoolClientDomainOutput", {
      value: userPoolDomain.domainName,
    });

    new cdk.CfnOutput(this, "IdentityPoolIdOutput", {
      value: identityPool.ref,
    });

    new cdk.CfnOutput(this, "RegionOutput", {
      value: this.region,
    });
  }
}

async function getOktaMetadataUrl(stage: string): Promise<string> {
  try {
    const oktaMetadataUrl = await getParameter(
      `ssm:/configuration/${stage}/oktaMetadataUrl`
    );
    return oktaMetadataUrl;
  } catch (error) {
    if ((error as Error).message.includes("Failed to fetch parameter")) {
      console.warn(
        'Ignoring "Failed to fetch parameter" error:',
        (error as Error).message
      );
      return "";
    } else {
      throw error;
    }
  }
}
