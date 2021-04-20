import { SES } from "aws-sdk";
var ses = new SES({ region: "us-east-1" });

/**
 * Handler responsible for sending notification to business users,
 * each time a state takes an uncertify action on any of their quarterly forms
 */
 handler(async (event, context) => {
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

  ses.sendEmail(email, function (err, data) {
    callback(null, { err: err, data: data });
    if (err) {
      console.log(err);
      context.fail(err);
    } else {
      console.log(data);
      context.succeed(event);
    }
  });
  callback(null, "message");
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
