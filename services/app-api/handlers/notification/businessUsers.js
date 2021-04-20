/**
 * Handler responsible for sending notification to bussiness users
 * that have not submitted their data at the end of a quarter - all reports in progress
 */

 exports.handler(async (event, context, callback) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
});
