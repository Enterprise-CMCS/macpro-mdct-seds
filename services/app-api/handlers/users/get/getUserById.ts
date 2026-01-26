import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { notFound, ok } from "../../../libs/response-lib.ts";
import { AuthUser } from "../../../storage/users.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  await authorizeAdmin(event);

  const params = {
    TableName: process.env.AuthUserTable,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":userId": event.pathParameters!["userId"],
    },
    FilterExpression: "userId = :userId",
  };

  const scanResult = await dynamoDb.scan(params);
  const user = scanResult.Items[0] as AuthUser | undefined;

  if (!user) {
    return notFound();
  }

  return ok(user);
});
