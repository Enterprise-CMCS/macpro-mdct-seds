import * as cognitolib from "../libs/cognito-lib.js";
const userPoolId = process.env.userPoolId;
import users from "../libs/users.json" assert { type: "json" };

export async function handler(_event, _context, _callback) {
  for (let user of users) {
    var poolData = {
      UserPoolId: userPoolId,
      Username: user.username,
      MessageAction: "SUPPRESS",
      UserAttributes: user.attributes,
    };
    var passwordData = {
      Password: process.env.bootstrapUsersPassword,
      UserPoolId: userPoolId,
      Username: user.username,
      Permanent: true,
    };
    var attributeData = {
      Username: user.username,
      UserPoolId: userPoolId,
      UserAttributes: user.attributes,
    };

    try {
      // This may error if the user already exists
      await cognitolib.createUser(poolData);
    } catch {
      /* swallow this exception and continue */
    }

    try {
      //userCreate must set a temp password first, calling setPassword to set the password for consistent dev login
      await cognitolib.setPassword(passwordData);
    } catch {
      /* swallow this exception and continue */
    }

    try {
      //if user exists and attributes are updated in this file updateUserAttributes is needed to update the attributes
      await cognitolib.updateUserAttributes(attributeData);
    } catch {
      /* swallow this exception and continue */
    }
  }
}
