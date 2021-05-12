import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";
var AWS = require("aws-sdk");

/**
 * Handler responsible for sending notification to business users,
 * each time a state takes an uncertify action on any of their quarterly forms
 */
export const main = handler(async (event, context) => {
  let data = JSON.parse(event.body);
  console.log(data, "data");

  const email = await unCetifiedTemplate(data);
  console.log(email, "Email before sent");
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
    status: "sucess",
    message: "quartly Businness owners email sent",
  };
});

let date = {
  year: new Date().getFullYear(),
  quarter: new Date().getMonth(),
};

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

// Email template for business users
async function unCetifiedTemplate(payload) {
  const sendToEmail = await getBusinessUsersEmail();
  const todayDate = new Date().toISOString().split("T")[0];
  console.log("send to email: ", sendToEmail);

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
          This is an automated message to notify you that ${payload.state} has
          uncertified the following SEDS report as of [${todayDate}]:
          [Report Number] for FFY [${date.year}] Quarter [${date.quarter}]
          Please follow up with the state’s representatives if you have any questions.
          -MDCT SEDS`,
        },
      },
      Subject: {
        Data: `SEDS Uncertify Notice - [${date.year}]`,
      },
    },
    Source: "jgillis@collabralink.com",
  };
}
