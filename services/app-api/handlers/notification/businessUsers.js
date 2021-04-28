import handler from "./../../libs/handler-lib";
var aws = require("aws-sdk");

/**
 * Handler responsible for sending notification to bussiness Owners
 * that have not submitted their data at the end of a quarter - all reports in progress
 */

export const main = handler(async (event, context) => {

  let data = JSON.parse(event.body);
  const businessUsers = businessOwnersTemplate(data);
  console.log(businessUsers, "yeet");

  const businessUserEmail = businessOwners(event)
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

// obtains all businessUsers emails
async function getBusinessUsersEmail() {
  const businessOwnersEmails = [];
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {"#r": "role"},
    ExpressionAttributeValues: {":role": "business"},
    FilterExpression: "#r = :role",
  };
  const result = await dynamoDb.scan(params);
  if (result.Count === 0) {
    return false;
  }
  const payload = result["Items"];
  payload.map(userInfo => {
    if(userInfo.email) {
      businessOwnersEmails.push(userInfo.email);
    };
  });
  console.log(businessOwnersEmails);
  return businessOwnersEmails;
}

function businessOwnersTemplate(payload) {
  const sendToEmail = await getBusinessUsersEmail();
  const recipient = {
    TO: sendToEmail,
    SUBJECT: "FFY[Fiscal Year] Q[Quarter] SEDS Enrollment Data Overdue",
    FROM: 'eniola.olaniyan@cms.hhs.gov',
    MESSAGE: `
    Dear Business Owners,

    This is an automated message to notify you that the states
    listed below have not certified their SEDS data for FFY[Fiscal Year] Q[Quarter]
    as of [DateTimeOfAction]:

    State:  ${payload.state} // a list of states that have not certified their SEDS data

    Regards,
    Seds.
    `,
  };
  return {
    Destination: {
      ToAddresses: recipient.TO,  // All Active Users With the “bus_user” Role
    },
    Message: {
      Body: {
        Text: {
          Data: recipient.MESSAGE // Email Template body
        },
      },
      Subject: {
        Data: recipient.SUBJECT, // Email Template subject
      },
    },
    Source: recipient.FROM
  };
}
