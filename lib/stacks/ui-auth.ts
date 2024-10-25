import * as cdk from "aws-cdk-lib";
import {
  aws_cognito as cognito,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  aws_ssm as ssm,
  aws_wafv2 as wafv2,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { WafConstruct } from "../local-constructs/waf";

interface UiAuthStackProps extends cdk.NestedStackProps {
  stack: string;
  api: cdk.aws_apigateway.RestApi;
  applicationEndpointUrl: string;
  stage: string;
  oktaMetadataUrl: string;
  bootstrapUsersPasswordArn: string;
}

export class UiAuthStack extends cdk.NestedStack {
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;
  public readonly bootstrapUsersFunction:
    | lambda_nodejs.NodejsFunction
    | undefined;

  constructor(scope: Construct, id: string, props: UiAuthStackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage") || "dev";

    // Cognito User Pool
    this.userPool = new cognito.UserPool(this, "UserPool", {
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

    let idp = undefined;

    if (props.oktaMetadataUrl) {
      idp = new cognito.CfnUserPoolIdentityProvider(
        this,
        "CognitoUserPoolIdentityProvider",
        {
          providerName: "Okta",
          providerType: "SAML",
          userPoolId: this.userPool.userPoolId,
          providerDetails: {
            MetadataURL: props.oktaMetadataUrl,
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

    // Cognito User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPoolClientName: `${stage}-user-pool-client`,
      userPool: this.userPool,
      authFlows: {
        userPassword: true,
      },
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
          props.applicationEndpointUrl || "https://localhost:3000/",
        ],
        defaultRedirectUri: props.applicationEndpointUrl,
        logoutUrls: [props.applicationEndpointUrl || "https://localhost:3000/"],
      },
      supportedIdentityProviders: idp
        ? [(idp as unknown) as cognito.UserPoolClientIdentityProvider]
        : undefined,
      generateSecret: false,
    });

    (this.userPoolClient.node
      .defaultChild as cognito.CfnUserPoolClient).addPropertyOverride(
      "ExplicitAuthFlows",
      ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH"]
    );

    this.userPoolDomain = new cognito.UserPoolDomain(this, "UserPoolDomain", {
      userPool: this.userPool,
      cognitoDomain: { domainPrefix: `${stage}-login-user-pool-client` },
    });

    // Cognito Identity Pool
    this.identityPool = new cognito.CfnIdentityPool(
      this,
      "CognitoIdentityPool",
      {
        identityPoolName: `${stage}IdentityPool`,
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: this.userPoolClient.userPoolClientId,
            providerName: this.userPool.userPoolProviderName,
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
            "cognito-identity.amazonaws.com:aud": this.identityPool.ref,
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
        identityPoolId: this.identityPool.ref,
        roles: { authenticated: cognitoAuthRole.roleArn },
      }
    );

    new ssm.StringParameter(this, "CognitoUserPoolIdParameter", {
      parameterName: `/${stage}/ui-auth/cdk_cognito_user_pool_id`,
      stringValue: this.userPool.userPoolId,
    });
    new ssm.StringParameter(this, "CognitoUserPoolClientIdParameter", {
      parameterName: `/${stage}/ui-auth/cdk_cognito_user_pool_client_id`,
      stringValue: this.userPoolClient.userPoolClientId,
    });

    if (props.bootstrapUsersPasswordArn) {
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
          resources: [this.userPool.userPoolArn],
        })
      );

      lambdaApiRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["ssm:GetParameter"],
          resources: [props.bootstrapUsersPasswordArn],
        })
      );

      this.bootstrapUsersFunction = new lambda_nodejs.NodejsFunction(
        this,
        "bootstrapUsers",
        {
          entry: "services/ui-auth/handlers/createUsers.js",
          handler: "handler",
          runtime: lambda.Runtime.NODEJS_20_X,
          timeout: cdk.Duration.seconds(60),
          role: lambdaApiRole,
          environment: {
            userPoolId: this.userPool.userPoolId,
            bootstrapUsersPasswordArn: props.bootstrapUsersPasswordArn,
          },
        }
      );
    }

    const webAcl = new WafConstruct(
      this,
      "WafConstruct",
      { name: `ui-auth-cdk-${stage}-webacl-waf` },
      "REGIONAL"
    ).webAcl;

    new wafv2.CfnWebACLAssociation(this, "CognitoUserPoolWAFAssociation", {
      resourceArn: this.userPool.userPoolArn,
      webAclArn: webAcl.attrArn,
    });

    // Outputs
    new cdk.CfnOutput(this, "UserPoolIdOutput", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientIdOutput", {
      value: this.userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "UserPoolClientDomainOutput", {
      value: this.userPoolDomain.domainName,
    });

    new cdk.CfnOutput(this, "IdentityPoolIdOutput", {
      value: this.identityPool.ref,
    });

    new cdk.CfnOutput(this, "RegionOutput", {
      value: this.region,
    });
  }
}
