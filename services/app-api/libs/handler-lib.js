import * as debug from "./debug-lib";

export default function handler(lambda) {
  return async function (event, context, callback) {
    let body, statusCode;

    // Start debugger
    debug.init(event, context, callback);

    try {
      // Run the Lambda
      body = await lambda(event, context, callback);
      statusCode = 200;
    } catch (e) {
      // Print debug messages
      debug.flush(e);

      body = { error: e.message };
      statusCode = 500;
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
