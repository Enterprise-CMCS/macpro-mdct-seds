import handler from "../../libs/handler-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { logger } from "../../libs/debug-lib.ts";
import { forbidden, notFound, ok } from "../../libs/response-lib.ts";
import { getUser } from "../../storage/users.ts";
import { isIntegral } from "../../libs/parsing.ts";

export const main = handler(readUserIdFromPath, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const user = await getUser(request.parameters.userId);

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
