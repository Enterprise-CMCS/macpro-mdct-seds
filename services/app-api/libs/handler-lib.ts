import * as debug from "./debug-lib";
import { isAuthorized } from "./authorization";
import { buildResponse } from "./response-lib";

export default function handler(lambda) {
  return async function (event, context) {
    debug.init(event, context);

    // *** if this invocation is a pre-warm, do nothing and return
    if (event.source === "serverless-plugin-warmup") {
      debug.default("Warmed up!");
      return buildResponse(200, undefined);
    }

    const authorized = await isAuthorized(event);
    if (!authorized) {
      const body = { error: "User is not authorized to access this resource." };
      return buildResponse(403, body);
    }

    try {
      const body = await lambda(event, context);
      return buildResponse(200, body);
    } catch (e) {
      debug.flush(e);
      const body = { error: e.message };
      return buildResponse(500, body)
    }
  };
}
