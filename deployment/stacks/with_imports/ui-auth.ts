import { Construct } from "constructs";
import {
  aws_cognito as cognito,
} from "aws-cdk-lib";

interface CreateUiAuthComponentsProps {
  scope: Construct;
  stage: string;
<<<<<<< HEAD
  oktaMetadataUrl: string;
=======
>>>>>>> 85799ee9f7516979d902b4574fbc59699700cb92
}

export function createUiAuthComponents(props: CreateUiAuthComponentsProps) {
  const {
    scope,
    stage,
<<<<<<< HEAD
    oktaMetadataUrl,
  } = props;

  const userPool = new cognito.UserPool(scope, "UserPool");

  // if (oktaMetadataUrl) {
  //   new cognito.CfnUserPoolIdentityProvider(
  //     scope,
  //     "CognitoUserPoolIdentityProvider",
  //     {
  //       userPoolId: userPool.userPoolId,
  //       providerName: "Okta",
  //       providerType: "SAML",
  //       providerDetails: {
  //         MetadataURL: oktaMetadataUrl,
  //       },
  //     }
  //   );
  // }

  const userPoolClient = new cognito.UserPoolClient(scope, "UserPoolClient", { userPool });

  // const userPoolDomain = new cognito.UserPoolDomain(scope, "UserPoolDomain", {
  //   userPool,
  //   cognitoDomain: { domainPrefix: `${stage}-login-user-pool-client` },
  // });
=======
  } = props;

  const userPool = new cognito.UserPool(scope, "UserPool", {
    userPoolName: `${stage}-user-pool`,
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

  new cognito.UserPoolClient(scope, "UserPoolClient", { userPool });
>>>>>>> 85799ee9f7516979d902b4574fbc59699700cb92

  const identityPool = new cognito.CfnIdentityPool(
    scope,
    "CognitoIdentityPool",
    {
      allowUnauthenticatedIdentities: false,
    }
  );

  new cognito.CfnIdentityPoolRoleAttachment(scope, "CognitoIdentityPoolRoles", {
    identityPoolId: identityPool.ref,
  });
<<<<<<< HEAD

  return {
    userPoolDomainName: userPoolDomain.domainName,
    identityPoolId: identityPool.ref,
    userPoolId: userPool.userPoolId,
    userPoolClientId: userPoolClient.userPoolClientId,
  };
=======
>>>>>>> 85799ee9f7516979d902b4574fbc59699700cb92
}
