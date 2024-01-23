import handler from "../../../libs/handler-lib";
import { generateQuarterlyForms } from "../../shared/sharedFunctions";
import { getUserCredentialsFromJwt } from "../../../libs/authorization";

/**
 * Generates initial form data and statuses for all states given a year and quarter
 * NOTE: This function is triggered by a user on the client-side
 */

export const main = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  // verify whether there is a user logged in
  const currentUser = await getUserCredentialsFromJwt(event);
  if (!currentUser) {
    throw new Error("No authorized user.");
  }

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
