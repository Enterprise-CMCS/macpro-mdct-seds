/* eslint-disable no-console */
import handler from "./../../libs/handler-lib.js";
import {
  getUsersEmailByRole,
  getUncertifiedStatesAndForms,
} from "../shared/sharedFunctions.js";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({ region: "us-east-1" });

/**
 * Handler responsible for sending notification to bussiness Owners.
 * as a CMS Business User, I want to know which states have NOT submitted
 * their data yet (in other words - all states with ‘in progress’ reports for the prior quarter)
 */

export const main = handler(async (_event, _context) => {
  const email = await businessOwnersTemplate();
  const command = new SendEmailCommand(email);
  try {
    const data = await client.send(command);
    console.log(data.MessageId);
  } catch (err) {
    console.error(err, err.stack);
  }
  return {
    status: "success",
    message: "Quarterly Business owners email sent",
  };
});

function getQuarter() {
  let d = new Date();
  let m = Math.floor(d.getMonth() / 3) + 2;
  return m > 4 ? m - 4 : m;
}
const quarter = getQuarter();
const year = new Date().getFullYear();

async function businessOwnersTemplate() {
  const sendToEmailArry = await getUsersEmailByRole("business");
  const sendToEmail = sendToEmailArry.map((e) => e.email);
  const uncertifiedStates = await getUncertifiedStatesAndForms(year, quarter);

  // Build string of all states and forms
  let uncertifiedStatesList = "";
  uncertifiedStates.map((item) => {
    uncertifiedStatesList += `${item.state} -${item.form.map(
      (form) => ` ${form}`
    )}\n`;
  });

  const todayDate = new Date().toISOString().split("T")[0];
  const fromEmail = "mdct@cms.hhs.gov";
  const recipient = {
    TO: sendToEmail,
    SUBJECT: "FFY SEDS Enrollment Data Overdue",
    FROM: fromEmail,
    MESSAGE: `
This is an automated message to notify you that the states listed below have not certified their SEDS data for FFY${year} Q${quarter} as of: ${todayDate}

${uncertifiedStatesList}

Please follow up with the state’s representatives if you have any questions.

Regards,
MDCT SEDS.
`,
  };

  return {
    Destination: {
      ToAddresses: recipient.TO,
    },
    Message: {
      Body: {
        Text: {
          Data: recipient.MESSAGE,
        },
      },
      Subject: {
        Data: recipient.SUBJECT,
      },
    },
    Source: recipient.FROM,
  };
}
