import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import {
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { ok, notFound } from "../../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  await authorizeAnyUser(event);

  const params = {
    TableName: process.env.AuthUserTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":userId": event.pathParameters!["userId"],
    },
    FilterExpression: "userId = :userId",
  };

  const queryResult = await dynamoDb.scan(params);

  if (!queryResult["Items"]) {
    return notFound({
      status: "error",
      message: "No user by specified id found",
    });
  }

  const foundUser = queryResult.Items[0];
  await authorizeAdminOrUserWithEmail(event, foundUser.userId);
  return ok({
    status: "success",
    data: queryResult["Items"][0],
  });
});
