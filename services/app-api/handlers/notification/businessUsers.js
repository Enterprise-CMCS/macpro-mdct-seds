import handler from "./../../libs/handler-lib";
/**
 * Handler responsible for sending notification to bussiness users
 * that have not submitted their data at the end of a quarter - all reports in progress
 */

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
});
