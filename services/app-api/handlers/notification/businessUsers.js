import handler from "./../../libs/handler-lib";
var aws = require("aws-sdk");

/**
 * Handler responsible for sending notification to bussiness Owners
 * that have not submitted their data at the end of a quarter - all reports in progress
 */

export const main = handler(async (event, context) => {
  
  // let data = JSON.parse(event.body);

  const test = getBusinessUsersEmail();
  console.log(test, "yeeeeet");


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

// async function businessOwnersTemplate(payload) {
//   const sendToEmail = await getBusinessUsersEmail();
//   const fromEmail = "eniola.olaniyan@cms.hhs.gov";

//   const recipient = {
//     TO: sendToEmail,
//     SUBJECT: "FFY[Fiscal Year] Q[Quarter] SEDS Enrollment Data Overdue",
//     FROM: fromEmail,
//     MESSAGE: `
//     This is an automated message to notify you that the states listed below have
//     not certified their SEDS data for FFY[Fiscal Year] Q[Quarter] as of 
//     [DateTimeOfAction]:

//     - ${payload.state}
//     - State1
//     - State2
//     - State3
    
//     Please follow up with the state’s representatives if you have any questions.

//     Regards,
//     MDCT SEDS.

//     `,
//   };
//   return {
//     Destination: {
//       ToAddresses: recipient.TO
//     },
//     Message: {
//       Body: {
//         Text: {
//           Data: recipient.MESSAGE
//         },
//       },
//       Subject: {
//         Data: recipient.SUBJECT
//       },
//     },
//     Source: recipient.FROM
//   };
// }
