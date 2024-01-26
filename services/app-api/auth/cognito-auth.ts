import { CognitoIdentityServiceProvider } from "aws-sdk";

import { localUser } from "./local-user";
import { obtainUserByEmail } from "../handlers/users/get/obtainUserByEmail";
import dynamoDb from "../libs/dynamodb-lib";

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

const getUserEmailFromAuthProvider = async (authProvider: string) => {
  if (authProvider === "offlineContext_cognitoAuthenticationProvider") {
    return localUser.email;
  }

  const userInfo = parseAuthProvider(authProvider);
  const username = await obtainUsernameBySub(userInfo.userPoolUserId);
  const cognito = new CognitoIdentityServiceProvider();

  const response = await cognito
    .adminGetUser({
      Username: username,
      UserPoolId: userInfo.userPoolId,
    })
    .promise();

  return response.UserAttributes?.find((attr) => attr.Name === "email")?.Value;
};

export const getCurrentUserInfo = async (event) => {
  const email = await getUserEmailFromAuthProvider(
    event.requestContext.identity.cognitoAuthenticationProvider
  );

  try {
    const currentUser = await obtainUserByEmail(email);
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

const obtainUsernameBySub = async (usernameSub: string) => {
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":usernameSub": usernameSub,
    },
    FilterExpression: "usernameSub = :usernameSub",
  };

  const result = await dynamoDb.scan(params);

  return result.Items?.[0]?.username;
};
