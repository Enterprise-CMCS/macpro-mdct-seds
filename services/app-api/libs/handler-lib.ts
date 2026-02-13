import { sanitizeObject } from "../shared/sanitize.ts";
import {
  APIGatewayProxyEvent,
  HandlerLambda,
  ParameterParser,
} from "../shared/types.ts";
import { AuthUser, scanForUserWithSub } from "../storage/users.ts";
import { getUserDetailsFromEvent } from "./authorization.ts";
import * as logger from "./debug-lib.ts";
import {
  badRequest,
  internalServerError,
  unauthenticated,
} from "./response-lib.ts";

export default function handler<TParams>(
  parser: ParameterParser<TParams>,
  lambda: HandlerLambda<TParams>
) {
  return async function (event: APIGatewayProxyEvent) {
    try {
      logger.init();
      logger.debug("API event: %O", {
        body: event.body,
        pathParameters: event.pathParameters,
        queryStringParameters: event.queryStringParameters,
      });

      const user = await determineUser(event);
      if (!user) {
        return unauthenticated();
      }

      let body: object | undefined = undefined;
      if (event.body) {
        body = sanitizeObject(JSON.parse(event.body));
      }

      const parameters = parser(event);
      if (!parameters) {
        return badRequest();
      }

      return await lambda({ user, body, parameters });
    } catch (err) {
      logger.error("Error: %O", err);
      return internalServerError((err as Error).message);
    } finally {
      logger.flush();
    }
  };
}

/**
 * Read the cognito token. If appropriate, search the AuthUser DB table.
 */
const determineUser = async (event: APIGatewayProxyEvent) => {
  const userFromToken = getUserDetailsFromEvent(event);
  if (event.path === "/getCurrentUser") {
    // getCurrentUser creates AuthUser records, so they needn't already exist.
    return userFromToken as AuthUser;
  } else {
    return await scanForUserWithSub(userFromToken.usernameSub);
  }
};
