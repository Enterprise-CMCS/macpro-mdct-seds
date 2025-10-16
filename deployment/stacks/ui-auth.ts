import { Construct } from "constructs";
import {
  aws_cognito as cognito,
  aws_iam as iam,
  aws_wafv2 as wafv2,
  Aws,
  CfnOutput,
  custom_resources as cr,
  Duration,
  RemovalPolicy,
} from "aws-cdk-lib";
import { WafConstruct } from "../constructs/waf";
import { isLocalStack } from "../local/util";
import { Lambda } from "../constructs/lambda";

interface CreateUiAuthComponentsProps {
  scope: Construct;
  project: string;
  stage: string;
  isDev: boolean;
  applicationEndpointUrl: string;
  oktaMetadataUrl: string;
  restApiId: string;
  bootstrapUsersPassword?: string;
  bootstrapExternalUsersPassword?: string;
  secureCloudfrontDomainName?: string;
  userPoolDomainPrefix?: string;
  userPoolName?: string;
}

export function createUiAuthComponents(props: CreateUiAuthComponentsProps) {
  const {
    scope,
    project,
    stage,
    isDev,
    applicationEndpointUrl,
    restApiId,
    oktaMetadataUrl,
    bootstrapUsersPassword,
    bootstrapExternalUsersPassword,
    secureCloudfrontDomainName,
    userPoolDomainPrefix,
    userPoolName,
  } = props;

  const userPool = new cognito.UserPool(scope, "UserPool", {
    userPoolName: userPoolName ?? `${stage}-user-pool`,
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
    // advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED, DEPRECATED WE NEED FEATURE_PLAN.plus if we want to use StandardThreatProtectionMode.FULL_FUNCTION which I think is the new way to do this
    removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
  });

  const providerName = "Okta";

  const oktaIdp = new cognito.CfnUserPoolIdentityProvider(
    scope,
    "CognitoUserPoolIdentityProvider",
    {
      providerName,
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

  const supportedIdentityProviders = [
    cognito.UserPoolClientIdentityProvider.custom(providerName),
  ];

  const appUrl =
    secureCloudfrontDomainName ??
    applicationEndpointUrl ??
    "http://localhost:3000/";

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
      callbackUrls: [appUrl],
      defaultRedirectUri: appUrl,
      logoutUrls: [appUrl],
    },
    supportedIdentityProviders,
    generateSecret: false,
    accessTokenValidity: Duration.minutes(30),
    idTokenValidity: Duration.minutes(30),
    refreshTokenValidity: Duration.hours(24),
  });

  userPoolClient.node.addDependency(oktaIdp);

  const userPoolDomain = new cognito.UserPoolDomain(scope, "UserPoolDomain", {
    userPool,
    cognitoDomain: {
      domainPrefix:
        userPoolDomainPrefix ?? `${project}-${stage}-login-user-pool-client`,
    },
  });

  const identityPool = new cognito.CfnIdentityPool(
    scope,
    "CognitoIdentityPool",
    {
      identityPoolName: `${stage}-IdentityPool`,
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

  if (bootstrapUsersPassword || bootstrapExternalUsersPassword) {
    const service = "ui-auth";
    bootstrapUsersFunction = new Lambda(scope, "bootstrapUsers", {
      stackName: `${service}-${stage}`,
      entry: "services/ui-auth/handlers/createUsers.js",
      handler: "handler",
      memorySize: 1024,
      timeout: Duration.seconds(60),
      additionalPolicies: [
        new iam.PolicyStatement({
          actions: ["*"],
          resources: [userPool.userPoolArn],
          effect: iam.Effect.ALLOW,
        }),
      ],
      environment: {
        userPoolId: userPool.userPoolId,
        bootstrapUsersPassword: bootstrapUsersPassword!,
        bootstrapExternalUsersPassword: bootstrapExternalUsersPassword!,
      },
      isDev,
    }).lambda;
  }

  if (!isLocalStack) {
    const waf = new WafConstruct(
      scope,
      "CognitoWafConstruct",
      { name: `${project}-${stage}-ui-auth` },
      "REGIONAL"
    );

    new wafv2.CfnWebACLAssociation(scope, "CognitoUserPoolWAFAssociation", {
      resourceArn: userPool.userPoolArn,
      webAclArn: waf.webAcl.attrArn,
    });
  }

  if (bootstrapUsersFunction) {
    const bootstrapUsersInvoke = new cr.AwsCustomResource(
      scope,
      "InvokeBootstrapUsersFunction",
      {
        onCreate: {
          service: "Lambda",
          action: "invoke",
          parameters: {
            FunctionName: bootstrapUsersFunction.functionName,
            InvocationType: "Event",
            Payload: JSON.stringify({}),
          },
          physicalResourceId: cr.PhysicalResourceId.of(
            `InvokeBootstrapUsersFunction-${stage}`
          ),
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: [bootstrapUsersFunction.functionArn],
        }),
        resourceType: "Custom::InvokeBootstrapUsersFunction",
      }
    );

    bootstrapUsersFunction.grantInvoke(bootstrapUsersInvoke.grantPrincipal);

    bootstrapUsersInvoke.node.addDependency(bootstrapUsersFunction);
  }

  new CfnOutput(scope, "CognitoIdentityPoolId", {
    value: identityPool.ref,
  });

  new CfnOutput(scope, "CognitoUserPoolId", {
    value: userPool.userPoolId,
  });

  new CfnOutput(scope, "CognitoUserPoolClientId", {
    value: userPoolClient.userPoolClientId,
  });

  new CfnOutput(scope, "CognitoUserPoolClientDomain", {
    value: userPoolDomain.domainName,
  });

  return {
    userPoolDomainName: userPoolDomain.domainName,
    identityPoolId: identityPool.ref,
    userPoolId: userPool.userPoolId,
    userPoolClientId: userPoolClient.userPoolClientId,
  };
}
