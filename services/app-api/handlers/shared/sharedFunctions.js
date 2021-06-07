import dynamoDb from "../../libs/dynamodb-lib";

let date = {
  year: new Date().getFullYear(),
  quarter: new Date().getMonth(),
};

console.log("date: ", date);

export async function getUsersEmailByRole(role) {
  const UsersObj = [];
  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: { "#r": "role" },
    ExpressionAttributeValues: { ":role": role },
    FilterExpression: "#r = :role",
  };
  const result = await dynamoDb.scan(params);
  if (result.Count === 0) {
    return [];
  }
  const payload = result["Items"];
  payload.map((userInfo) => {
    const obj = {
      state: userInfo.states,
      email: userInfo.email,
    };
    UsersObj.push(obj);
  });
  return UsersObj;
}

// retrieve all states have NOT submitted their data yet
// (in other words - all states with ‘in progress’ reports for the prior quarter)
export async function getUncertifiedStates() {
  // house the list of states from the state forms
  let UncertifiedstateList = [];
  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#Unceritifiedstatus": "status",
      // "#theYear": "year",
      // "#theQuarter": "quarter",
    },
    ExpressionAttributeValues: {
      ":status": "In Progress",
      ":year": date.year,
      // ":quarter": date.quarter,
    },
    FilterExpression:
    "#Unceritifiedstatus = :status AND #theYear = :year",

      // "#Unceritifiedstatus = :status AND #theYear = :year AND #theQuarter = :quarter",
  };
  // data returned from the database which contains the database Items
  const result = await dynamoDb.scan(params);

  console.log("uncretified forms", result);
  if (result.Count === 0) {
    return [
      {
        message:
          "At this time, There are no states which is currrently status: In Progress in this current quarter",
      },
    ];
  }
  // List of the state forms that are "In Progress"
  const payload = result.Items;
  payload.map((stateInfo) => {
    // pulled the state from each state forms and pushed into array
    UncertifiedstateList.push(stateInfo.program_code);
  });
  let filteredStateList = UncertifiedstateList.filter(function (
    elem,
    index,
    self
  ) {
    // filter the state list so we dont have duplicates
    return index === self.indexOf(elem);
  });
  return filteredStateList;
}

export async function getQuestionsByYear(specifiedYear) {
  const questionParams = {
    TableName:
      process.env.FORM_QUESTIONS_TABLE_NAME ??
      process.env.FormQuestionsTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":specifiedYear": parseInt(specifiedYear),
    },
    FilterExpression: "#theYear = :specifiedYear",
  };

  const questionResult = await dynamoDb.scan(questionParams);

  return questionResult.Items;
}

export async function getStatesList() {
  const stateParams = {
    TableName: process.env.STATES_TABLE_NAME ?? process.env.StatesTableName,
  };

  const stateResult = await dynamoDb.scan(stateParams);

  return stateResult.Items;
}

export async function getFormDescriptions() {
  const formDescriptionParams = {
    TableName: process.env.FORMS_TABLE_NAME ?? process.env.FormsTableName,
  };

  const formDescription = await dynamoDb.scan(formDescriptionParams);

  return formDescription.Items;
}

export async function getFormResultByStateString(stateFormString) {
  const params = {
    TableName:
      process.env.FORM_ANSWERS_TABLE_NAME ?? process.env.FormAnswersTableName,
    ExpressionAttributeValues: {
      ":state_form": stateFormString,
    },
    FilterExpression: "state_form = :state_form",
  };

  const result = await dynamoDb.scan(params);

  return result.Items;
}
