import dynamoDb from "../../libs/dynamodb-lib";

export async function getUsersEmailByRole(role) {
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

  return result.Items.map((userInfo) => ({
    state: userInfo.states,
    email: userInfo.email,
  }));
}

// retrieve all states have NOT submitted their data yet
// (in other words - all states with ‘in progress’ reports for the prior quarter)
export async function getUncertifiedStates(year, quarter) {
  // house the list of states from the state forms
  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#Unceritifiedstatus": "status",
      "#theYear": "year",
      "#theQuarter": "quarter",
    },
    ExpressionAttributeValues: {
      ":status": "In Progress",
      ":year": year,
      ":quarter": quarter,
    },
    FilterExpression:
      "#Unceritifiedstatus = :status AND #theYear = :year AND #theQuarter = :quarter",
  };

  // data returned from the database which contains the database Items
  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return [
      {
        message:
          "At this time, There are no states which is currrently status: In Progress in this current quarter",
      },
    ];
  }

  return result.Items.map((stateInfo) => stateInfo.state_id).filter(
    (stateId, i, stateIds) => i === stateIds.indexOf(stateId)
  );
}

// retrieve all states have NOT submitted their data yet AND their missing forms
// States with 'In Progress' as status/
export async function getUncertifiedStatesAndForms(year, quarter) {
  // house the list of states from the state forms
  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#Unceritifiedstatus": "status",
      "#theYear": "year",
      "#theQuarter": "quarter",
    },
    ExpressionAttributeValues: {
      ":status": "In Progress",
      ":year": year,
      ":quarter": quarter,
    },
    FilterExpression:
      "#Unceritifiedstatus = :status AND #theYear = :year AND #theQuarter = :quarter",
  };

  // data returned from the database which contains the database Items
  const result = await dynamoDb.scan(params);

  if (result.Count === 0) {
    return [
      {
        message:
          "At this time, There are no states which is currently status: In Progress in this current quarter",
      },
    ];
  }

  // Get list of states and forms (one per form)
  const states = result.Items.map((stateInfo) => {
    return { state: stateInfo.state_id, form: stateInfo.form };
  }).filter((stateId, i, stateIds) => i === stateIds.indexOf(stateId));

  // Reduce to one state with array of forms
  let mergedObj = states.reduce((acc, obj) => {
    if (acc[obj.state]) {
      acc[obj.state].form.push(obj.form);
    } else {
      acc[obj.state] = { state: obj.state, form: [obj.form] };
    }
    return acc;
  }, {});

  // Build output in correct format
  let output = [];
  for (let prop in mergedObj) {
    output.push(mergedObj[prop]);
  }

  // Sort alphabetically by state
  output.sort((a, b) => {
    let stateA = a.state.toUpperCase();
    let stateB = b.state.toUpperCase();
    return stateA < stateB ? -1 : stateA > stateB ? 1 : 0;
  });

  // Sort forms alphabetically
  output.map((a) => {
    return a.form.sort();
  });

  return output;
}

export async function getQuestionsByYear(specifiedYear) {
  const parsedYear = parseInt(specifiedYear);

  const questionParams = {
    TableName:
      process.env.FORM_QUESTIONS_TABLE_NAME ??
      process.env.FormQuestionsTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":specifiedYear": parsedYear > 2021 ? parsedYear : 2021,
    },
    FilterExpression: "#theYear = :specifiedYear",
  };

  let questionResult;

  try {
    questionResult = await dynamoDb.scan(questionParams);
  } catch (e) {
    console.log("getQuestionsByYear failed");
    throw e;
  }

  return questionResult.Items;
}

export async function getStatesList() {
  const stateParams = {
    TableName: process.env.STATES_TABLE_NAME ?? process.env.StatesTableName,
  };

  let stateResult;

  try {
    stateResult = await dynamoDb.scan(stateParams);
  } catch (e) {
    console.log("getStatesList failed");
    throw e;
  }

  return stateResult.Items;
}

export async function getFormDescriptions() {
  const formDescriptionParams = {
    TableName: process.env.FORMS_TABLE_NAME ?? process.env.FormsTableName,
  };

  let formDescription;
  try {
    formDescription = await dynamoDb.scan(formDescriptionParams);
  } catch (e) {
    console.log("getFormDescription failed");
    throw e;
  }

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

export async function findExistingStateForms(specifiedYear, specifiedQuarter) {
  const params = {
    TableName:
      process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":year": specifiedYear,
      ":quarter": specifiedQuarter,
    },
    FilterExpression: "#theYear = :year and quarter = :quarter",
    ProjectionExpression: "state_form",
  };

  const result = await dynamoDb.scan(params);

  let values = [];

  if (result.Count !== 0) {
    values = result.Items.map((id) => {
      return id.state_form;
    });
  }
  return values;
}

// This function is called when no answers are found in the question table matching the requested year
export async function fetchOrCreateQuestions(specifiedYear, specifiedQuarter) {
  let questions;
  let error;

  // THERE ARE NO QUESTIONS IN QUESTIONS TABLE

  // GET QUESTIONS FROM TEMPLATE
  const questionParams = {
    TableName:
      process.env.FORM_TEMPLATES_TABLE_NAME ??
      process.env.FormTemplatesTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":year": parseInt(specifiedYear),
    },
    KeyConditionExpression: "#theYear = :year",
  };

  const questionResult = await dynamoDb.query(questionParams);
  // return questionResult.Items;

  console.log("WHAT ARE THE QUESTIONS PLEASE", questionResult.Items);

  const questionTableName =
    process.env.FORM_QUESTIONS_TABLE_NAME ?? process.env.FormQuestionsTableName;

  if (questionResult.Count !== 0) {
    // add questions to question table
    // return questions
    // DONE
    return 1;
  } else {
    // these are the questions found in the template
    let questionsForThisYear = questionResult.Items;

    // const questionsFromTemplate = questionsForThisYear.map((questionFromTemplate) => {
    //   return {
    //     PutRequest: {
    //       Item: {
    //         ...questionFromTemplate,
    //         year: specifiedYear,
    //         created_date: new Date().toISOString(),
    //         last_modified: new Date().toISOString(),
    //       },
    //     },
    //   };
    // })
    // // There will be at most, 39 questions. The maximum for batchWrite is 25 so we'll proces one half at a time
    // const mid = Math.floor(questionsFromTemplate.length/2)
    // const firstBatch = questionsFromTemplate.slice(0, mid)
    // const secondBatch = questionsFromTemplate.slice(mid)
    // const splitQuestions = [firstBatch, secondBatch]

    // splitQuestions.forEach((batch) => {
    //   while ( i > 5){
    //     const {UnprocessedItems }= await dynamoDb.batchWrite({
    //       RequestItems: { [questionTableName]: batch }
    //     });
    //     i = (UnprocessedItems.length) ? (i-1) : (5)
    //   }
    // })

    // create new form from template
    // add questions to question table
    // return questions
    // Process this batch
  }
  // Dont trigger an error message, create the questions

  // GET questions from the template and POST questions to questions table
  // return questions (part of request?)

  // Else if no template for year, grab year and POST new template
  // from the new template, POST questions from the template to the questions table

  // const params = {
  //   TableName:
  //     process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
  //   ExpressionAttributeNames: {
  //     "#theYear": "year",
  //   },
  //   ExpressionAttributeValues: {
  //     ":year": specifiedYear,
  //     ":quarter": specifiedQuarter,
  //   },
  //   FilterExpression: "#theYear = :year and quarter = :quarter",
  //   ProjectionExpression: "state_form",
  // };

  // const result = await dynamoDb.scan(params);

  let values = [];

  // if (result.Count !== 0) {
  //   values = result.Items.map((id) => {
  //     return id.state_form;
  //   });

  // return error if there is one
  return 1;
}

// if there are no questions for a specific year
// trigger this function to grab the questions from the year's template (ENDPOINT)
// if there are no questions in the template, create them (ENDPOINT)
// grab the response? and return the questions

// const failureList = [];
// Batch write all items, rerun if any UnprocessedItems are returned and it's under the retry limit
// const batchWriteAll = async (tryRetryBatch, upperLimit, failList) => {
//   // Attempt first batch write
//   const { UnprocessedItems } = await dynamoDb.batchWrite(tryRetryBatch.batch);

//   // If there are any failures and under the retry limit
//   if (UnprocessedItems.length && upperLimit !== 0) {
//     const retryBatch = {
//       batch: UnprocessedItems,
//     };
//     return await batchWriteAll(retryBatch, upperLimit-1, list);
//   } else if (upperLimit < 0 ) {
//     // exceeded failure limit
//     console.error(
//       `Tried batch ${
//         upperLimit
//       } times. Failing batch ${JSON.stringify(tryRetryBatch)}`
//     );
//     failList.push({ failure: JSON.stringify(tryRetryBatch) });
//   }
// };
