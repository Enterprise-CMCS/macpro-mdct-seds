import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import {
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions.js";

export const main = handler(async (event) => {
  await authorizeAnyUser(event);

  const params = {
    TableName: process.env.AuthUserTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":userId": event.pathParameters["id"],
    },
    FilterExpression: "userId = :userId",
  };

  const queryResult = await dynamoDb.scan(params);

  let returnResult;

  if (!queryResult["Items"]) {
    returnResult = {
      status: "error",
      message: "No user by specified id found",
    };
  } else {
    const foundUser = queryResult.Items[0];
    await authorizeAdminOrUserWithEmail(event, foundUser.userId);
    returnResult = {
      status: "success",
      data: queryResult["Items"][0],
    };
  }

  return returnResult;
});
