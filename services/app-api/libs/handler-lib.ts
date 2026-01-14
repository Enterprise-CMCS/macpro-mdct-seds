import { sanitizeObject } from "../shared/sanitize.ts";
import * as logger from "./debug-lib.ts";
import { HttpResponse } from "./response-lib.ts";

export default function handler(
  lambda: (event: any, context: any) => Promise<HttpResponse>
) {
  return async function (event: any, context: any): Promise<HttpResponse> {
    if (event.body) {
      event.body = JSON.stringify(sanitizeObject(JSON.parse(event.body)));
    }

    logger.init();
    logger.debug("API event: %O", {
      body: event.body,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
    });

    try {
      // Run the Lambda
      const response = await lambda(event, context);

      // Extract and rebuild the response
      return {
        statusCode: response.statusCode,
        body: response.body,
        headers: response.headers,
      } as HttpResponse;
    } catch (e) {
      // Print debug messages
      logger.error("Error: %O", e);

      return {
        statusCode: 500,
        body: JSON.stringify({ error: (e as Error).message }),
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
      } as HttpResponse;
    } finally {
      logger.flush();
    }
  };
}
