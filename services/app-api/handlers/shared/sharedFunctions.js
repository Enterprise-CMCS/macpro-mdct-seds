import dynamoDb from "../../libs/dynamodb-lib";
import { updateCreateFormTemplate } from "../../../ui-src/src/libs/api";

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

// This function is called when no entries are found in the question table matching the requested year
export async function fetchOrCreateQuestions(specifiedYear) {
  // THERE ARE NO QUESTIONS IN QUESTIONS TABLE
  console.log("questions being fetched");
  let parsedYear = parseInt(specifiedYear);

  // GET QUESTIONS FROM TEMPLATE
  const templateParams = {
    TableName:
      process.env.FORM_TEMPLATES_TABLE_NAME ??
      process.env.FormTemplatesTableName,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":year": parsedYear,
    },
    KeyConditionExpression: "#theYear = :year",
  };

  let templateResult = await dynamoDb.query(templateParams);

  let questionsForThisYear;

  if (templateResult.Count === 0) {
    console.log("\n\n\n NO TEMPLATE FOR GIVEN YEAR", parsedYear);
    // no template was found matching this current year
    // trigger a function to generate a template & retrieve questions from template

    const previousYear = parsedYear - 1;

    const previousYearParams = {
      TableName:
        process.env.FORM_TEMPLATES_TABLE_NAME ??
        process.env.FormTemplatesTableName,
      ExpressionAttributeNames: {
        "#theYear": "year",
      },
      ExpressionAttributeValues: {
        ":year": previousYear,
      },
      FilterExpression: "#theYear = :year",
    };

    const previousYearTemplateResult = await dynamoDb.scan(previousYearParams);

    if (previousYearTemplateResult.Count === 0) {
      return {
        status: 500,
        message: `Failed to generate form template, check requested year`,
      };
    }

    const createdTemplateQuestions = replaceFormYear(
      specifiedYear,
      previousYearTemplateResult.Items[0]["template"]
    );

    try {
      await updateCreateFormTemplate({
        year: parsedYear,
        template: JSON.parse(createdTemplateQuestions),
      });
      questionsForThisYear = createdTemplateQuestions;
    } catch (e) {
      console.error(
        `Failed to template for ${specifiedYear} to form-template table`
      );
      return {
        status: 400,
        message: "Please verify that the template contains valid JSON",
      };
    }
  } else {
    questionsForThisYear = templateResult.Items[0]["template"];
  }

  // Add the questions that were created or found in an existing template to the questions table
  // these are the questions found in the template

  let questionSuccess = await addToQuestionTable(questionsForThisYear);

  // Add the questions created/accessed from a template to the status object returned from this function
  questionSuccess.payload = questionsForThisYear;
  return questionSuccess;
}

function replaceFormYear(year, templateQuestions) {
  let yearToReplace = `${year - 1}`;
  let currentYear = `${year}`;

  // Build searchregex
  let re = new RegExp("" + yearToReplace + "", "g");

  // Replace all instances of the previous year with the new year
  return JSON.parse(JSON.stringify(templateQuestions).replace(re, currentYear));
}

export async function addToQuestionTable(questionsForThisYear, questionYear) {
  // This function is for adding questions to the question table
  // By this point, questions have been found or created for a given year

  // Map through the found questions and create batch put requests for the questions table
  const questionsFromTemplate = questionsForThisYear.map((question) => {
    return {
      PutRequest: {
        Item: {
          ...question,
          year: parseInt(questionYear),
          created_date: new Date().toISOString(),
          last_modified: new Date().toISOString(),
        },
      },
    };
  });

  // There will be at most, 39 questions. The maximum for batchWrite is 25 so we'll proces one half at a time
  const mid = Math.floor(questionsFromTemplate.length / 2);
  const firstBatch = questionsFromTemplate.slice(0, mid);
  const secondBatch = questionsFromTemplate.slice(mid);
  const splitQuestions = [firstBatch, secondBatch];

  const questionTableName =
    process.env.FORM_QUESTIONS_TABLE_NAME ?? process.env.FormQuestionsTableName;

  // Add the questions found in the template to the form-questions table
  // this can/should be done recursively to better account for unprocessed items
  let failedItems = [];
  for (const batch of splitQuestions) {
    const { UnprocessedItems } = await dynamoDb.batchWrite({
      RequestItems: { [questionTableName]: batch },
    });
    // If some questions fail to write, add them to a list of failures
    if (UnprocessedItems.length) {
      failedItems.concat(UnprocessedItems);
    }
  }

  // retry any failed entries
  if (failedItems.length) {
    let secondResult;

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    (async function postponeSecondBatch() {
      await delay(2000);
      await dynamoDb.batchWrite({
        RequestItems: { [questionTableName]: failedItems },
      });
    })();

    console.log("UNPROCESSED ITEMS \n\n", secondResult.UnprocessedItems);
    // if some still fail, add them to a list of items to be returned, return status 500
    if (secondResult.UnprocessedItems.length) {
      console.error(
        `Failed to add all questions from template to question table. Failing batch: ${JSON.stringify(
          secondResult.UnprocessedItems
        )}`
      );
      return {
        status: 500,
        message: `Failed to add all questions from template to question table`,
      };
    }
  }

  return {
    status: 200,
    message: `Questions added to form questions table from template`,
  };
}
