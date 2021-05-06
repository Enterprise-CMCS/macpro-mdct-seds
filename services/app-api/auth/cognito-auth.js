import { CognitoIdentityServiceProvider } from "aws-sdk";

import { localUser } from "./local-user";
import { main as obtainUserByEmail } from "../handlers/users/post/obtainUserByEmail";
import { main as obtainUsernameBySub } from "../handlers/users/post/obtainUsernameBySub";

export const parseAuthProvider = (authProvider) => {
  // *** cognito authentication provider example:
  //              cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
  // *** where
  //              us-east-1_aaaaaaaaa                   ==>  User Pool id
  // *** and
  //              qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr  ==>  User Pool User Id
  try {
    const parts = authProvider.split(":");
    const userPoolIdParts = parts[parts.length - 3].split("/");

    const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
    const userPoolUserId = parts[parts.length - 1];

    return {
      status: "success",
      userId: userPoolUserId,
      poolId: userPoolId,
    };
  } catch (e) {
    return {
      status: "error",
      errorMessage:
        "Error (parseAuthProvider): parseAuth doesnt have enough parts",
      detailedErrorMessage: e,
    };
  }
};

const userAttrDict = (cognitoUser) => {
  const attributes = {};

  if (cognitoUser.UserAttributes) {
    cognitoUser.UserAttributes.forEach((attribute) => {
      if (attribute.Value) {
        attributes[attribute.Name] = attribute.Value;
      }
    });
  }

  return attributes;
};

// userFromCognitoAuthProvider hits the Cogntio API to get the information in the authProvider
export const userFromCognitoAuthProvider = async (authProvider) => {
  let userObject = {};
  const cognito = new CognitoIdentityServiceProvider();

  console.log("\n\n@@@@@@auth provider is:");
  console.log(authProvider);

  switch (authProvider) {
    case "offlineContext_cognitoAuthenticationProvider":
      userObject = localUser;
      break;

    default:
      const userInfo = parseAuthProvider(authProvider);

      console.log("\n\n~~~~User info from COGNITO:");
      console.log(userInfo);

      // calling a dependency so we have to try
      try {
        const userResponse = await cognito
          .adminGetUser({
            Username: userInfo.userId,
            UserPoolId: userInfo.poolId,
          })
          .promise();

        console.log("????userResponse from cognito:");
        console.log(userResponse);

        // we lose type safety here...
        const attributes = userAttrDict(userResponse);

        userObject = {
          status: "success",
          email: attributes.email,
          name: attributes.given_name + " " + attributes.family_name,
          state: attributes["custom:state_code"],
          role: "STATE_USER",
        };
      } catch (e) {
        let errorObject;

        try {
          // *** retrieve user from the database
          const body = JSON.stringify({
            usernameSub: userInfo.userId,
          });

          const currentUser = await obtainUsernameBySub({
            body: body,
          });

          const userResponse = await cognito
            .adminGetUser({
              Username: JSON.parse(currentUser.body)["Items"][0].Username,
              UserPoolId: userInfo.poolId,
            })
            .promise();

          console.log("????AND NOW   userResponse from cognito:");
          console.log(userResponse);

          // we lose type safety here...
          const attributes = userAttrDict(userResponse);

          userObject = {
            status: "success",
            email: attributes.email,
            name: attributes.given_name + " " + attributes.family_name,
            state: attributes["custom:state_code"],
            role: "STATE_USER",
          };
        } catch (e1) {
          errorObject = {
            status: "error",
            errorMessage:
              "Error (userFromCognitoAuthProvider): cannot retrieve user info",
            detailedErrorMessage: e,
          };
          return errorObject;
        }
      }
      break;
  }

  return userObject;
};

export const getCurrentUserInfo = async (event) => {
  const user = await userFromCognitoAuthProvider(
    event.requestContext.identity.cognitoAuthenticationProvider
  );

  console.log("!!!!!!!!!This is the identity!!!!!!:\n\n");
  console.log(event.requestContext.identity);

  console.log("\n\n!!!!user is: ");
  console.log(user);

  const email =
    user.email !== undefined
      ? user.email
      : user["UserAttributes"].find((record) => record["Name"] === "email")
          .Value;

  console.log("\n\n????found this:");
  console.log(email);

  let body;

  if (email !== undefined)
    body = JSON.stringify({
      email: email,
    });

  const currentUser = await obtainUserByEmail({
    body: body,
  });

  console.log(currentUser);

  return {
    status: "success",
    data: JSON.parse(currentUser.body)["Items"][0],
  };
};
