import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";
var AWS = require("aws-sdk");

/**
 * Handler responsible for sending notification to business users,
 * each time a state takes an uncertify action on any of their quarterly forms
 */
export const main = handler(async (event, context) => {
  let data = JSON.parse(event.body);
  const email = await unCetifiedTemplate(data);
  let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(email)
    .promise();
  try {
    const data = await sendPromise;
    console.log(data, "data: promise");
    console.log(data.MessageId, "data.MessageId");
  } catch (err) {
    console.error(err, err.stack);
  }
  return {
    status: "success",
    message: "Uncertified Business owners email sent",
  };
});

// logic to retrieve all business users emails
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

async function unCetifiedTemplate(payload) {
  const sendToEmail = await getBusinessUsersEmail();
  const todayDate = new Date().toISOString().split("T")[0];

  if (sendToEmail.Count === 0) {
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
