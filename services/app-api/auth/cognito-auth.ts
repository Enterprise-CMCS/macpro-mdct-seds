import { CognitoIdentityServiceProvider } from "aws-sdk";

import { localUser } from "./local-user";
import { obtainUserByEmail } from "../handlers/users/get/obtainUserByEmail";
import { obtainUsernameBySub } from "../handlers/users/get/obtainUsernameBySub";

const parseAuthProvider = (authProvider: string) => {
  // *** cognito authentication provider example:
  //              cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
  // *** where
  //              us-east-1_aaaaaaaaa                   ==>  User Pool id
  // *** and
  //              qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr  ==>  User Pool User Id
  const [userPool, _, userPoolUserId] = authProvider.split(":");
  const [__, ___, userPoolId] = userPool.split("/");

  return {
    userPoolUserId,
    userPoolId,
  };
};

// userFromCognitoAuthProvider hits the Cognito API to get the information in the authProvider
// TODO this function, as currently used, should be renamed to getUserEmailFromAuthProvider. Because that's all we do.
const userFromCognitoAuthProvider = async (authProvider: string) => {
  if (authProvider === "offlineContext_cognitoAuthenticationProvider") {
    return localUser;
  }

  const userInfo = parseAuthProvider(authProvider);
  const currentUser = await obtainUsernameBySub(userInfo.userPoolUserId);
  const cognito = new CognitoIdentityServiceProvider();

  const userResponse = await cognito
    .adminGetUser({
      Username: currentUser.username,
      UserPoolId: userInfo.userPoolId,
    })
    .promise();

  const attributeMap = new Map(userResponse.UserAttributes?.map(
    (attr) => [attr.Name, attr.Value]
  ));

  return {
    email: attributeMap.get("email"),
    name: attributeMap.get("given_name") + " " + attributeMap.get("family_name"),
    state: attributeMap.get("custom:state_code"),
    role: "STATE_USER",
  };
};

export const getCurrentUserInfo = async (event) => {
  const user = await userFromCognitoAuthProvider(
    event.requestContext.identity.cognitoAuthenticationProvider
  );

  try {
    const currentUser = await obtainUserByEmail(user.email);
    return {
      status: "success",
      data: currentUser.Items[0],
    }
  }
  catch (err) {
    // TODO this is probably not what we want. What happens when no user?
    return {
      status: "uh-oh",
      data: undefined
    }
  }
};
