import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

// var aws = require("aws-sdk");

/**
 * Handler responsible for sending notification to state users At the end of each Quarter.
 * At the end of each Quarter, as a State User, I want to know if my state has NOT certified its data yet.
 */

export const main = handler(async (event, context) => {
  // let data = JSON.parse(event.body);

  await getStateUsersEmail();

  // const email = stateTemplate(data)
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

async function getStateUsersEmail() {
  const stateUsersEmail = [];

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: { "#r": "role" },
    ExpressionAttributeValues: { ":role": "state" },
    FilterExpression: "#r = :role",
  };
  const result = await dynamoDb.scan(params);
  if (result.Count === 0) {
    return false;
  }
  const payload = result["Items"];
  payload.map((userInfo) => {
    if (userInfo.email) {
      stateUsersEmail.push(userInfo.email);
    }
  });
  return stateUsersEmail;
}

// async function getUncertifiedStates() {
//   // house the list of states from the state forms
//   let UncertifiedstateList = [];

//   const params = {
//     TableName: process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
//     Select: "ALL_ATTRIBUTES",
//     ExpressionAttributeNames: {"#Unceritifiedstatus": "status"},
//     ExpressionAttributeValues: {
//       ":status": "Not Started",
//     },
//     FilterExpression: "#Unceritifiedstatus = :status",
//   };
//   // data returned from the database which contains the database Items
//   const result = await dynamoDb.scan(params);
//   if (result.Count === 0) {
//     return [{
//       message: "At this time, There are no states which is currrently status: In Progress"
//     }];
//   }
//   // List of the state forms that are "In Progress"
//   const payload = result.Items;
//   payload.map(stateInfo => {
//     // pulled the state from each state forms and pushed into array
//     UncertifiedstateList.push(stateInfo.program_code)
//   });
//   let filteredStateList = UncertifiedstateList.filter(function(elem, index, self) {
//     // filter the state list so we dont have duplicates
//     return index === self.indexOf(elem);
//   });
//   return filteredStateList;
// };

// async function stateTemplate() {
//   const sendToEmail = await getStateUsersEmail();
//   // const UncerteriedStateList = await getUncertifiedStates();
//   const fromEmail = "eniola.olaniyan@cms.hhs.gov";

//   const recipient = {
//     TO: sendToEmail,
//     SUBJECT: "Reminder: [State] FFY[Fiscal Year] Q[Quarter] SEDS Enrollment Data Overdue",
//     FROM: fromEmail,
//     MESSAGE: `
//     Hello [State],

//     We are reaching out to check on the status of [State]'s FFY[Fiscal Year]
//     Q[Quarter] child enrollment data submission in the Statistical Enrollment Data System (SEDS).

//     FFY[Fiscal Year] Q[Quarter] reporting of enrollment data to the SEDS was
//     due on [DUE DATE]. Our records indicate that [State] has not yet submitted
//     the required enrollment data to SEDS at this time. Please let us know when
//     we can expect your submission.

//     If your state has any other outstanding Quarter(s) of data, please submit
//     that information along with your FFY[Fiscal Year] Q[Quarter] data.

//     If your state allows retroactive eligibility, the initial enrollment reports will be
//     considered preliminary and your state will have the opportunity to submit final reports
//     thirty (30) days after the end of the next quarter (with next quarter’s preliminary report).
//     The final reports should include information about children whose eligibility was
//     retroactive to the earlier quarter.

//     If you have any questions,
//     please send an email to: MDCTHelp@cms.hss.gov

//     Thank you in advance for your prompt response to this message.

//     Regards,
//     CMS SEDS TA Team.

//     `,
//   };
//   return {
//     Destination: { ToAddresses: recipient.TO}, // All Active Users With the “state” Role Assigned to the State
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
