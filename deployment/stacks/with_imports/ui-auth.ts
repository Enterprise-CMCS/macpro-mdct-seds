import { Construct } from "constructs";
import {
  aws_cognito as cognito,
} from "aws-cdk-lib";

interface CreateUiAuthComponentsProps {
  scope: Construct;
  stage: string;
  oktaMetadataUrl: string;
}

export function createUiAuthComponents(props: CreateUiAuthComponentsProps) {
  const {
    scope,
    stage,
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

  return {
    userPoolDomainName: userPoolDomain.domainName,
    identityPoolId: identityPool.ref,
    userPoolId: userPool.userPoolId,
    userPoolClientId: userPoolClient.userPoolClientId,
  };
}
