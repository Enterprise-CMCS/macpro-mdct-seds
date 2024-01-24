import handler from "../../../libs/handler-lib";
import { generateQuarterlyForms } from "../../shared/quarterlyForms";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";
import debug from "../../../libs/debug-lib";
import { buildResponse } from "../../../libs/response-lib";

/**
 * Generates initial form data and statuses for all states given a year and quarter
 * NOTE: This function is triggered by a user on the client-side
 */

export const main = handler(async (event, context) => {
  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  console.log("this is the current user", currentUser);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

  // TODO: parameters here
  const result = await generateQuarterlyForms(event);
  const { failureList, specifiedQuarter, specifiedYear } = result;

  if (failureList.length > 0) {
    return {
      status: 500,
      message: `Failed to write all entries to database.`,
    };
  }

  return {
    status: 200,
    message: `Forms successfully created for Quarter ${specifiedQuarter} of ${specifiedYear}`,
  };
});

/**
 * Generates initial form data and statuses for all states given a year and quarter
 * NOTE: This function is triggered on a schedule by Cron
 */
export const scheduledJob = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    debug("Warmed up!");
    return buildResponse(200, undefined);
  }
  
  // TODO: parameters here
  // TODO: Note that generateQuarterlyForms can throw; give it a try-catch
  const result = await generateQuarterlyForms(event);
  const { failureList, specifiedQuarter, specifiedYear } = result;

  if (failureList.length > 0) {
    return {
      status: 500,
      message: `Failed to write all entries to database.`,
    };
  }

  return {
    status: 200,
    message: `Forms successfully created for Quarter ${specifiedQuarter} of ${specifiedYear}`,
  };
});
