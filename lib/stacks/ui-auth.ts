import * as cdk from "aws-cdk-lib";
import {
  aws_iam as iam,
  aws_cognito as cognito,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { getParameter } from "../utils/ssm";

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
    new cognito.UserPoolClient(this, "UserPoolClient", {
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

    new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool,
      cognitoDomain: { domainPrefix: `${stage}-login-user-pool-client` },
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
