import handler from "../../libs/handler-lib";
var aws = require("aws-sdk");
var lambda = new aws.Lambda({
  region: "us-east-1",
});

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let data = JSON.parse(event.body);
  console.log("before invoke", data);

  lambda.invoke(
    {
      FunctionName: "uncertified",
      Payload: JSON.stringify(event), // pass params
      InvocationType: "RequestResponse",
    },
    function (error, data) {
      if (error) {
        context.done("error", error);
      }
      if (data.Payload) {
        context.succeed(data.Payload);
      }
    }
  );
});

// function uncetifiedTemplate(payload) {
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
