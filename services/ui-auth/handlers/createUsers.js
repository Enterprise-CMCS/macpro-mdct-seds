import * as cognitolib from "../libs/cognito-lib";
const userPoolId = process.env.userPoolId;
const users = require("../libs/users.json");
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const region = process.env.AWS_REGION;

async function myHandler(_event, _context, _callback) {
  const password = (
    await new SSMClient({ region }).send(
      new GetParameterCommand({
        Name: process.env.bootstrapUsersPasswordArn,
        WithDecryption: true,
      })
    )
  ).Parameter.Value;

  for (let user of users) {
    var poolData = {
      UserPoolId: userPoolId,
      Username: user.username,
      MessageAction: "SUPPRESS",
      UserAttributes: user.attributes,
    };
    var passwordData = {
      Password: password,
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
