import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import {
  authorizeAnyUser,
  authorizeAdminOrUserWithEmail,
} from "../../../auth/authConditions.js";

export const main = handler(async (event, context) => {
  await authorizeAnyUser(event);
  let data = JSON.parse(event.body);
  const result = await obtainUserByUsername(data.username);
  authorizeAdminOrUserWithEmail(result.Items[0].email);
  return result;
});

export const obtainUserByUsername = async (username) => {
  const params = {
    TableName: process.env.AUTH_USER_TABLE,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":username": username,
    },
    FilterExpression: "username = :username",
  };

  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return false;
  }

  return result;
};
