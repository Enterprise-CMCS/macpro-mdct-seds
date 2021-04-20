var AWS = require('aws-sdk');
import handler from "./../../libs/handler-lib";
/**
 * Handler responsible for sending notification to business users,
 * each time a state takes an uncertify action on any of their quarterly forms
 */
export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  console.log(event);

  let data = JSON.parse(event.body);
  const email = unCetifiedTemplate(data);

  console.log(email);
  console.log(data);

  let sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(email)
    .promise();
  try {
    const data = await sendPromise;
    console.log(data.MessageId);
  } catch (err) {
    console.error(err, err.stack);
  }

  //   ses.sendEmail(email, function (err, data) {
  //     if (err) {
  //       console.log(err);
  //       context.fail(err);
  //     } else {
  //       console.log(data);
  //       context.succeed(event);
  //     }
  //   });
  //   return { message: "sucess, email sent" };
});

function unCetifiedTemplate(payload) {
  return {
    Destination: {
      ToAddresses: ["eolaniyan@collabralink.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: `
  Hi Stephnie,
  
  A State user has uncertiied their quarterly forms
  Details:
   - Username: ${payload.username}
     State:  ${payload.state}
     Role:  ${payload.role}
     Email:  ${payload.email}
     
  Regards,
  Seds.
  `,
        },
      },
      Subject: {
        Data: `Uncerteried quartly form`,
      },
    },
    Source: process.env.emailSource || "eniola.olaniyan@cms.hhs.gov",
  };
}
