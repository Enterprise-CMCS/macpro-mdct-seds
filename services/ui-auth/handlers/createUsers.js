import * as cognitolib from "../libs/cognito-lib";
const userPoolId = process.env.userPoolId;
const users = require("../libs/users.json");

async function myHandler(_event, _context, _callback) {
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

    await cognitolib.createUser(poolData);
    //userCreate must set a temp password first, calling setPassword to set the password configured in SSM for consistent dev login
    await cognitolib.setPassword(passwordData);
    //if user exists and attributes are updated in this file updateUserAttributes is needed to update the attributes
    await cognitolib.updateUserAttributes(attributeData);
  }
}

exports.handler = myHandler;
