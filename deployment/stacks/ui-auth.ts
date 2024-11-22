import { Construct } from "constructs";
import {
  aws_cognito as cognito,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  aws_wafv2 as wafv2,
  RemovalPolicy,
  Aws,
  Duration,
} from "aws-cdk-lib";
import { WafConstruct } from "../constructs/waf";
import { IManagedPolicy } from "aws-cdk-lib/aws-iam";

interface CreateUiAuthComponentsProps {
  scope: Construct;
  stage: string;
  oktaMetadataUrl: string;
  applicationEndpointUrl: string;
  restApiId: string;
  bootstrapUsersPasswordArn: string;
  iamPermissionsBoundary: IManagedPolicy;
  iamPath: string;
}

export function createUiAuthComponents(props: CreateUiAuthComponentsProps) {
  const {
    scope,
    stage,
    oktaMetadataUrl,
    applicationEndpointUrl,
    restApiId,
    bootstrapUsersPasswordArn,
    iamPath,
    iamPermissionsBoundary,
  } = props;

  const userPool = new cognito.UserPool(scope, "UserPool", {
    userPoolName: `${stage}-user-pool`,
    removalPolicy: RemovalPolicy.DESTROY,
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

  if (oktaMetadataUrl) {
    idp = new cognito.CfnUserPoolIdentityProvider(
      scope,
      "CognitoUserPoolIdentityProvider",
      {
        providerName: "Okta",
        providerType: "SAML",
        userPoolId: userPool.userPoolId,
        providerDetails: {
          MetadataURL: oktaMetadataUrl,
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

  const userPoolClient = new cognito.UserPoolClient(scope, "UserPoolClient", {
    userPoolClientName: `${stage}-user-pool-client`,
    userPool,
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
      callbackUrls: [applicationEndpointUrl || "https://localhost:3000/"],
      defaultRedirectUri: applicationEndpointUrl,
      logoutUrls: [applicationEndpointUrl || "https://localhost:3000/"],
    },
    supportedIdentityProviders: idp
      ? [(idp as unknown) as cognito.UserPoolClientIdentityProvider]
      : undefined,
    generateSecret: false,
  });

  (userPoolClient.node
    .defaultChild as cognito.CfnUserPoolClient).addPropertyOverride(
    "ExplicitAuthFlows",
    ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH"]
  );

  const userPoolDomain = new cognito.UserPoolDomain(scope, "UserPoolDomain", {
    userPool,
    cognitoDomain: { domainPrefix: `${stage}-login-user-pool-client` },
  });

  const identityPool = new cognito.CfnIdentityPool(
    scope,
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

  const cognitoAuthRole = new iam.Role(scope, "CognitoAuthRole", {
    permissionsBoundary: iamPermissionsBoundary,
    path: iamPath,
    assumedBy: new iam.FederatedPrincipal(
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
      CognitoAuthorizedPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: [
              "mobileanalytics:PutEvents",
              "cognito-sync:*",
              "cognito-identity:*",
            ],
            resources: ["*"],
            effect: iam.Effect.ALLOW,
          }),
          new iam.PolicyStatement({
            actions: ["execute-api:Invoke"],
            resources: [
              `arn:aws:execute-api:${Aws.REGION}:${Aws.ACCOUNT_ID}:${restApiId}/*`,
            ],
            effect: iam.Effect.ALLOW,
          }),
        ],
      }),
    },
  });

  new cognito.CfnIdentityPoolRoleAttachment(scope, "CognitoIdentityPoolRoles", {
    identityPoolId: identityPool.ref,
    roles: { authenticated: cognitoAuthRole.roleArn },
  });

  let bootstrapUsersFunction;

  if (bootstrapUsersPasswordArn) {
    const lambdaApiRole = new iam.Role(scope, "BootstrapUsersLambdaApiRole", {
      permissionsBoundary: iamPermissionsBoundary,
      path: iamPath,
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

    lambdaApiRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["ssm:GetParameter"],
        resources: [bootstrapUsersPasswordArn],
      })
    );

    // TODO: test deploy and watch performance with scope using lambda.Function vs lambda_nodejs.NodejsFunction
    bootstrapUsersFunction = new lambda_nodejs.NodejsFunction(
      scope,
      "bootstrapUsers",
      {
        entry: "services/ui-auth/handlers/createUsers.js",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        timeout: Duration.seconds(60),
        role: lambdaApiRole,
        environment: {
          userPoolId: userPool.userPoolId,
          bootstrapUsersPasswordArn: bootstrapUsersPasswordArn,
        },
      }
    );
  }

  const webAcl = new WafConstruct(
    scope,
    "CognitoWafConstruct",
    { name: `ui-auth-${stage}-webacl-waf` },
    "REGIONAL"
  ).webAcl;

  new wafv2.CfnWebACLAssociation(scope, "CognitoUserPoolWAFAssociation", {
    resourceArn: userPool.userPoolArn,
    webAclArn: webAcl.attrArn,
  });

  return {
    userPoolDomain,
    bootstrapUsersFunction,
    identityPool,
    userPool,
    userPoolClient,
  };
}
