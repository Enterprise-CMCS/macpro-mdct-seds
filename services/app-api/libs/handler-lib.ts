import * as logger from "./debug-lib.ts";

export default function handler(lambda) {
  return async function (event) {
    let body, statusCode;

    logger.init();
    logger.debug("API event: %O", {
      body: event.body,
      pathParameters: event.pathParameters,
      queryStringParameters: event.queryStringParameters,
    });

    try {
      // Run the Lambda
      body = await lambda(event);
      statusCode = 200;
    } catch (e) {
      // Print debug messages
      logger.error("Error: %O", e);

      body = { error: e.message };
      statusCode = 500;
    } finally {
      logger.flush();
    }

    // Return HTTP response

    return {
      statusCode,
      body: JSON.stringify(body),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
    };
  };
}
