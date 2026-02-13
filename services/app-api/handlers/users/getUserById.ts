import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { logger } from "../../libs/debug-lib.ts";
import { forbidden, notFound, ok } from "../../libs/response-lib.ts";
import { AuthUser } from "../../storage/users.ts";
import { isIntegral } from "../../libs/parsing.ts";

export const main = handler(readUserIdFromPath, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const params = {
    TableName: process.env.AuthUserTable,
    FilterExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": request.parameters.userId },
  };

  const scanResult = await dynamoDb.scan(params);
  const user = scanResult.Items[0] as AuthUser | undefined;

  if (!user) {
    return notFound();
  }

  return ok(user);
});

function readUserIdFromPath(evt: APIGatewayProxyEvent) {
  const userId = evt.pathParameters?.userId;
  if (!isIntegral(userId)) {
    logger.warn("Invalid userId in path.");
    return undefined;
  }
  return { userId };
}
