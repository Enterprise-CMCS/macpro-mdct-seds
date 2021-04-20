import handler from "../../libs/handler-lib";
var aws = require("aws-sdk");
// var ses = new aws.SES({ region: "us-east-1" });

/**
 * Handler responsible for sending notification to business users,
 * each time a state takes an uncertify action on any of their quarterly forms
 */

export const main = handler(async (event, context, callback) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  let data = JSON.parse(event.body);
  console.log(data);
  console.log(event);
//   const email = unCetifiedTemplate(data);

//   console.log(email);
//   console.log(data);

//   await ses.sendEmail(email).promise();
});

// function unCetifiedTemplate(payload) {
//   return {
//     Destination: {
//       ToAddresses: ["eolaniyan@collabralink.com"],
//     },
//     Message: {
//       Body: {
//         Text: {
//           Data: `
//   Hi Stephnie,
  
//   A State user has uncertiied their quarterly forms
//   Details:
//    - Username: ${payload.username}
//      State:  ${payload.state}
//      Role:  ${payload.role}
//      Email:  ${payload.email}
     
//   Regards,
//   Seds.
//   `,
//         },
//       },
//       Subject: {
//         Data: `Uncerteried quartly form`,
//       },
//     },
//     Source: process.env.emailSource || "eniola.olaniyan@cms.hhs.gov",
//   };
// }
