import { sanitizeObject } from "../shared/sanitize.ts";
import * as logger from "./debug-lib.ts";
import { HttpResponse, internalServerError } from "./response-lib.ts";

export default function handler(lambda: (event: any) => Promise<HttpResponse>) {
  return async function (event: any): Promise<HttpResponse> {
    if (event.body) {
      event.body = JSON.stringify(sanitizeObject(JSON.parse(event.body)));
    }

    logger.init();
    logger.debug("API event: %O", {
      body: event.body,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
    });

    // Log user identity for error correlation
    if (event.requestContext?.identity) {
      logger.debug("User identity: %O", {
        cognitoIdentityId: event.requestContext.identity.cognitoIdentityId,
        sourceIp: event.requestContext.identity.sourceIp,
        userAgent: event.requestContext.identity.userAgent,
        userArn: event.requestContext.identity.userArn,
      });
    }

    try {
      // Run the Lambda and return the response
      return await lambda(event);
    } catch (e) {
      // Print debug messages
      logger.error("Error: %O", e);

      return internalServerError({ error: (e as Error).message });
    } finally {
      logger.flush();
    }
  };
}
