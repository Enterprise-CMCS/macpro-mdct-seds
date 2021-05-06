import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";
var AWS = require("aws-sdk");
var ses = new AWS.SES({ region: "us-east-1" });

/**
 * Handler responsible for sending notification to state users At the end of each Quarter.
 * At the end of each Quarter, as a State User, I want to know if my state has NOT certified its data yet.
 */

export const main = handler(async (event, context) => {

  const email = await stateUsersTemplate();
  ses.sendEmail(email, function (err, data) {
    if (err) {
      console.log(err);
      context.fail(err);
    } else {
      console.log(data);
      context.succeed(event);
    }
  });
  return {
    status: "success",
    message: "quartly Businness owners email sent"
  };
});

let date = {
  year: new Date().getFullYear(),
  quarter: new Date().getMonth(),
};

async function getUncertifiedStates() {
  // house the list of states from the state forms
  let UncertifiedstateList = [];
  const params = {
    TableName: process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#Unceritifiedstatus": "status",
      "#theYear": "year",
      "#theQuarter": "quarter"
    },
    ExpressionAttributeValues: {
      ":status": "In Progress",
      ":year": date.year,
      ":quarter": date.quarter,
    },
    FilterExpression: "#Unceritifiedstatus = :status and #theYear = :year and #theQuarter = :quarter",
  };
  // data returned from the database which contains the database Items
  const result = await dynamoDb.scan(params);
  if (result.Count === 0) {
    return [{
      message: "At this time, There are no states which is currrently status: In Progress in this current quarter"
    }];
  }
  // List of the state forms that are "In Progress"
  const payload = result.Items;
  payload.map(stateInfo => {
    // pulled the state from each state forms and pushed into array
    UncertifiedstateList.push(stateInfo.program_code);
  });
  let filteredStateList = UncertifiedstateList.filter(function(elem, index, self) {
    // filter the state list so we dont have duplicates
    return index === self.indexOf(elem);
  });
  return filteredStateList;
};

// get all state users in our system by role
async function getStateUsers() {
  const stateUsersObj = [];
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
    const obj = {
      state: userInfo.states,
      email: userInfo.email
    };
    stateUsersObj.push(obj);
  });
  return stateUsersObj;
}

// returns a list of state users emails whose state isnt fully certified
async function certifiedStateUsersEmail() {
  const allStateEmails = await getStateUsers();
  const uncertifiedStateList = await getUncertifiedStates();
  let stateUsersToEmail = [];
  allStateEmails.map((e) => {
    if (uncertifiedStateList.includes(e.state[0])) {
      stateUsersToEmail.push(e.email);
    }
  });
  return stateUsersToEmail;
}


// creates a template for stateUsers
async function stateUsersTemplate() {
  // Email of state users whose state isnt certified yet
  const stateUsersToEmail = await certifiedStateUsersEmail();
  const fromEmail = "jgillis@collabralink.com";
  let todayDate = new Date().toISOString().split('T')[0];

  const recipient = {
    TO: stateUsersToEmail,
    SUBJECT: `Reminder: [State] FFY[${date.year}] Q[${date.quarter}] SEDS Enrollment Data Overdue`,
    FROM: fromEmail,
    MESSAGE: `
    Hello State user,

    We are reaching out to check on the status of your state's FFY[${date.year}]
    Q[${date.quarter}] child enrollment data submission in the Statistical Enrollment Data System (SEDS).

    FFY[${date.year}] Q[${date.quarter}] reporting of enrollment data to the SEDS was
    due on [${todayDate}]. Our records indicate that [State] has not yet submitted
    the required enrollment data to SEDS at this time. Please let us know when
    we can expect your submission.

    If your state has any other outstanding Quarter(s) of data, please submit
    that information along with your FFY[Fiscal Year] Q[Quarter] data.

    If your state allows retroactive eligibility, the initial enrollment reports will be
    considered preliminary and your state will have the opportunity to submit final reports
    thirty (30) days after the end of the next quarter (with next quarter’s preliminary report).
    The final reports should include information about children whose eligibility was
    retroactive to the earlier quarter.

    If you have any questions,
    please send an email to: MDCTHelp@cms.hss.gov

    Thank you in advance for your prompt response to this message.

    Regards,
    CMS SEDS TA Team.

    `,
  };
  return {
    Destination: { ToAddresses: recipient.TO},
    Message: {
      Body: {
        Text: {
          Data: recipient.MESSAGE
        },
      },
      Subject: {
        Data: recipient.SUBJECT
      },
    },
    Source: recipient.FROM
  };
}
