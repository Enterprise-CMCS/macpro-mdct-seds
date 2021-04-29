import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

// var aws = require("aws-sdk");

/**
 * Handler responsible for sending notification to bussiness Owners.
 * as a CMS Business User, I want to know which states have NOT submitted
 * their data yet (in other words - all states with ‘in progress’ reports for the prior quarter)
 */

export const main = handler(async (event, context) => {
  // let data = JSON.parse(event.body);
  await businessOwnersTemplate();
  // const email = businessOwnersTemplate(data)
  // let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
  // .sendEmail(email)
  // .promise();
  // try {
  //   const data = await sendPromise;
  //   console.log(data.MessageId);
  // } catch (err) {
  //   console.error(err, err.stack);
  // }
  // return {
  //   status: "sucess",
  //   message: "quartly Businness owners email sent"
  // };
});

// obtains all businessUsers emails
async function getBusinessUsersEmail() {
  const businessOwnersEmails = [];
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: { "#r": "role" },
    ExpressionAttributeValues: { ":role": "business" },
    FilterExpression: "#r = :role",
  };
  const result = await dynamoDb.scan(params);
  if (result.Count === 0) {
    return false;
  }
  const payload = result["Items"];
  payload.map((userInfo) => {
    if (userInfo.email) {
      businessOwnersEmails.push(userInfo.email);
    }
  });
  return businessOwnersEmails;
}

// retrieve all states have NOT submitted their data yet
// (in other words - all states with ‘in progress’ reports for the prior quarter)
async function getUncertifiedStates() {
  const params = {
    TableName: process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {"#Unceritifiedstatus": "status"},
    ExpressionAttributeValues: {
      ":status": "In Progress",
    },
    FilterExpression: "#Unceritifiedstatus = :status",
  };
  const result = await dynamoDb.scan(params);
  if (result.Count === 0) {
    return {
      message: "At this time, There are no states which is currrently status: In Progress"
    }
  }
  return result;
}

async function businessOwnersTemplate(payload) {
  const sendToEmail = await getBusinessUsersEmail();
  const uncertifiedStates = getUncertifiedStates();

  console.log(uncertifiedStates, "yeet");

  const fromEmail = "eniola.olaniyan@cms.hhs.gov";

  const recipient = {
    TO: sendToEmail,
    SUBJECT: "FFY[Fiscal Year] Q[Quarter] SEDS Enrollment Data Overdue",
    FROM: fromEmail,
    MESSAGE: `
    This is an automated message to notify you that the states listed below have
    not certified their SEDS data for FFY[Fiscal Year] Q[Quarter] as of
    [DateTimeOfAction]:

    - State1
    - State2
    - State3

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
// -  ${payload.state}
