import handler from "./../../libs/handler-lib";
import {getUsersEmailByRole, getUncertifiedStates} from "../shared/sharedFunctions";
var AWS = require("aws-sdk");

/**
 * Handler responsible for sending notification to bussiness Owners.
 * as a CMS Business User, I want to know which states have NOT submitted
 * their data yet (in other words - all states with ‘in progress’ reports for the prior quarter)
 */

export const main = handler(async (event, context) => {
  const email = await businessOwnersTemplate();
  let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
  .sendEmail(email)
  .promise();
  try {
    const data = await sendPromise;
    console.log(data.MessageId);
  } catch (err) {
    console.error(err, err.stack);
  }
  return {
    status: "sucess",
    message: "quartly Businness owners email sent"
  };
});

async function businessOwnersTemplate() {
  const sendToEmailArry = await getUsersEmailByRole("business");
  const sendToEmail = sendToEmailArry.map(e => e.email);
  const uncertifiedStates = await getUncertifiedStates();
  const todayDate = new Date().toISOString().split('T')[0];
  const fromEmail = "jgillis@collabralink.com";
  const recipient = {
    TO: sendToEmail,
    SUBJECT: "FFY SEDS Enrollment Data Overdue",
    FROM: fromEmail,
    MESSAGE: `
    This is an automated message to notify you that the states listed below have
    not certified their SEDS data for FFY[${date.year}] Q[${date.quarter}] as of
    [${todayDate}]: {${uncertifiedStates}}

    Please follow up with the state’s representatives if you have any questions.

    Regards,
    MDCT SEDS.

    `,
  };
  return {
    Destination: {
      ToAddresses: recipient.TO
    },
    Message: {
      Body: {
        Text: {
          Data: recipient.MESSAGE
        },
      },
      Subject: {
        Data: recipient.SUBJECT
      },
    },
    Source: recipient.FROM
  };
}
