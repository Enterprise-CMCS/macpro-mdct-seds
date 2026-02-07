import handler from "./../../libs/handler-lib.ts";
import dynamoDb from "./../../libs/dynamodb-lib.ts";
import { canWriteStatusForState } from "../../auth/authConditions.ts";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  badRequest,
  forbidden,
  ok,
  unprocessable,
} from "../../libs/response-lib.ts";
import {
  emptyParser,
  isFormType,
  isIntegral,
  isStateAbbr,
} from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";

const client = new SESClient({ region: "us-east-1" });

/**
 * Handler responsible for sending notification to business users,
 * each time a state takes an uncertify action on any of their quarterly forms
 *
 * Note that this was disabled in Feb 2024. See docs/uncertified_emails.md
 */
export const main = handler(emptyParser, async (request) => {
  if (!isValidBody(request.body)) {
    return badRequest();
  }

  if (!canWriteStatusForState(request.user, request.body.formInfo.state_id)) {
    return forbidden();
  }

  if (request.user.role === "business") {
    return unprocessable(
      "Will not notify business users, since the uncertification was done by a business user."
    );
  }

  const email = await unCetifiedTemplate(request.body);
  const command = new SendEmailCommand(email);
  try {
    const data = await client.send(command);
    console.log(data, "data: promise");
    console.log(data.MessageId, "data.MessageId");
  } catch (err) {
    console.error(err, (err as Error).stack);
  }
  return ok({
    status: "success",
    message: "Uncertified Business owners email sent",
  });
});

// logic to retrieve all business users emails
async function getBusinessUsersEmail() {
  const businessOwnersEmails: string[] = [];
  const params = {
    TableName: process.env.AuthUserTable,
    FilterExpression: "#role = :role",
    ExpressionAttributeNames: { "#role": "role" },
    ExpressionAttributeValues: { ":role": "business" },
  };
  const result = await dynamoDb.scan(params);

  const payload = result.Items ?? [];
  payload.map((userInfo) => {
    if (userInfo.email) {
      businessOwnersEmails.push(userInfo.email);
    }
  });
  return businessOwnersEmails;
}

async function unCetifiedTemplate(payload: RequestBody) {
  const sendToEmail = await getBusinessUsersEmail();
  const todayDate = new Date().toISOString().split("T")[0];

  if (sendToEmail.length === 0) {
    throw new Error("No Business users found.");
  }
  return {
    Destination: {
      ToAddresses: sendToEmail,
    },
    Message: {
      Body: {
        Text: {
          Data: `
          This is an automated message to notify you that ${payload.formInfo.state_id} has uncertified the following SEDS report as of ${todayDate}:
          
          Form ${payload.formInfo.form} for FFY ${payload.formInfo.year} Quarter ${payload.formInfo.quarter} 

          Please follow up with the state’s representatives if you have any questions.

          -MDCT SEDS TEAM`,
        },
      },
      Subject: {
        Data: `SEDS Uncertify Notice - ${payload.formInfo.state_id} - ${todayDate}`,
      },
    },
    Source: "mdct@cms.hhs.gov",
  };
}

type RequestBody = {
  formInfo: {
    state_id: string;
    year: number;
    quarter: number;
    form: string;
  };
};

function isValidBody(body: unknown): body is RequestBody {
  if (!body || "object" !== typeof body) {
    logger.warn("body is required.");
    return false;
  }

  if (
    !("formInfo" in body) ||
    !body.formInfo ||
    "object" !== typeof body.formInfo
  ) {
    logger.warn("body.formInfo is required.");
    return false;
  }
  const formInfo = body.formInfo;

  if (!("state_id" in formInfo) || !isStateAbbr(formInfo.state_id)) {
    logger.warn("body.formInfo.state_id is invalid.");
    return false;
  }

  if (!("year" in formInfo) || !isIntegral(formInfo.year)) {
    logger.warn("body.formInfo.year is invalid.");
    return false;
  }

  if (!("quarter" in formInfo) || !isIntegral(formInfo.quarter)) {
    logger.warn("body.formInfo.quarter is invalid.");
    return false;
  }

  if (!("form" in formInfo) || !isFormType(formInfo.form)) {
    logger.warn("body.formInfo.form is invalid.");
    return false;
  }

  return true;
}
