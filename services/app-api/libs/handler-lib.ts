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
  ok,
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

      // MiniStack has no API Gateway MOCK preflight, so answer OPTIONS here. In
      // AWS, preflight never reaches the Lambda (see deployment/stacks/api.ts),
      // and AWS_ENDPOINT_URL is unset, so production auth flow is unchanged.
      if (event.httpMethod === "OPTIONS" && process.env.AWS_ENDPOINT_URL) {
        return ok();
      }

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
    } catch (error) {
      logger.error("Error: %O", error);
      return internalServerError((error as Error).message);
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
  if (!userFromToken) {
    return undefined;
  }

  if (event.path === "/getCurrentUser") {
    // getCurrentUser creates AuthUser records, so they needn't already exist.
    return userFromToken as AuthUser;
  } else {
    return await scanForUserWithSub(userFromToken.usernameSub);
  }
};
