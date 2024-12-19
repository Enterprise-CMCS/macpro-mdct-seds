import { Construct } from "constructs";
import {
  aws_cognito as cognito,
} from "aws-cdk-lib";

interface CreateUiAuthComponentsProps {
  scope: Construct;
}

export function createUiAuthComponents(props: CreateUiAuthComponentsProps) {
  const {
    scope,
  } = props;

  const userPool = new cognito.UserPool(scope, "UserPool", {
    signInAliases: {
      email: true,
    },
  });

  new cognito.UserPoolClient(scope, "UserPoolClient", { userPool });

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
}
