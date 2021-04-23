import handler from "./../../libs/handler-lib";
var aws = require("aws-sdk");
var lambda = new aws.Lambda({
  region: "us-east-1",
});

/**
 * Handler responsible for sending notification to bussiness Owners
 * that have not submitted their data at the end of a quarter - all reports in progress
 */

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  // let data = JSON.parse(event.body);
  const businessUsers = getBusinessUsers();
  console.log(businessUsers, "yeet");

  // const businessUserEmail = businessOwners(event)
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

// obtains all businessUsers by invoking the "obtainUserRole" lambda
async function getBusinessUsers() {
  try {
    const lambdaParams = {
      FunctionName: "app-api-notification-system-obtainUserByRole",
      // RequestResponse is important here. Without it we won't get the result Payload
      InvocationType: "RequestResponse",
      LogType: "Tail", // other option is 'None'
      Payload: {
        role: "business",
      },
    };
    // Lambda expects the Payload to be stringified JSON
    console.log("Lambda invoke started :) ");
    lambdaParams.Payload = JSON.stringify(lambdaParams.Payload);
    const lambdaResult = await lambda.invoke(lambdaParams).promise();
    console.log("Lambda invoke completed, result: ", lambdaResult.Payload);

    const resultObject = JSON.parse(lambdaResult.Payload);
    console.log(resultObject, "businesss Users");
    return {
      status: "Sucesss",
      message: "Business Owners retrieved",
      data: resultObject,
    };
  } catch (e) {
    throw e;
  }
}

// function businessOwners(payload) {
//   const recipient = {
//     TO: ["eolaniyan@collabralink.com"],
//     SUBJECT: "FFY[Fiscal Year] Q[Quarter] SEDS Enrollment Data Overdue",
//     FROM: 'eniola.olaniyan@cms.hhs.gov',
//     MESSAGE: `
//     Dear Business Owners,

//     This is an automated message to notify you that the states
//     listed below have not certified their SEDS data for FFY[Fiscal Year] Q[Quarter]
//     as of [DateTimeOfAction]:

//     State:  ${payload.state} // a list of states that have not certified their SEDS data

//     Regards,
//     Seds.
//     `,
//   };
//   return {
//     Destination: {
//       ToAddresses: recipient.TO,  // All Active Users With the “bus_user” Role
//     },
//     Message: {
//       Body: {
//         Text: {
//           Data: recipient.MESSAGE // Email Template body
//         },
//       },
//       Subject: {
//         Data: recipient.SUBJECT, // Email Template subject
//       },
//     },
//     Source: recipient.FROM
//   };
// }
