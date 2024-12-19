import { Construct } from "constructs";
import {
  aws_cognito as cognito,
} from "aws-cdk-lib";

interface CreateUiAuthComponentsProps {
  scope: Construct;
  stage: string;
}

export function createUiAuthComponents(props: CreateUiAuthComponentsProps) {
  const {
    scope,
    stage,
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
