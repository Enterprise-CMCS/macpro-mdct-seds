var aws = require("aws-sdk");
import handler from "./../../libs/handler-lib";
var ses = new aws.SES({ region: "us-east-1" });

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
