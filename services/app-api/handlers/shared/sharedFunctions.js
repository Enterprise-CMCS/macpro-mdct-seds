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
      ":specifiedYear": parsedYear,
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

// Return a map of all stateFormIds within the answers table for use when repairing old data sets
export async function getAnswersSet() {
  console.log("Building set of state forms with answers");
  const params = {
    TableName:
      process.env.FORM_ANSWERS_TABLE_NAME ?? process.env.FormAnswersTableName,
  };

  const result = await dynamoDb.scanMapToSet(
    params,
    (answer) => answer.state_form
  );
  console.log("- Done building set");

  return result;
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
      parsedYear,
      previousYearTemplateResult.Items[0]["template"]
    );

    try {
      await createFormTemplate(parsedYear, createdTemplateQuestions);
      questionsForThisYear = createdTemplateQuestions;
    } catch (e) {
      console.error(
        `Failed to add template for ${parsedYear} to form-template table`
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
  // these are the questions found in the template table or created along with a new template
  let questionSuccess = await addToQuestionTable(
    questionsForThisYear,
    parsedYear
  );

  // Add the questions created/accessed from a template to the status object returned from this function
  questionSuccess.payload = questionsForThisYear;
  return questionSuccess;
}

function replaceFormYear(year, templateQuestions) {
  const yearToReplace = `${year - 1}`;
  const currentYear = `${year}`;

  // Build searchregex
  const re = new RegExp("" + yearToReplace + "", "g");

  // Replace all instances of the previous year with the new year
  const updatedYear = JSON.parse(
    JSON.stringify(templateQuestions).replace(re, currentYear)
  );
  const updatedCreationDate = updatedYear.map((element) => {
    return {
      ...element,
      created_date: new Date().toISOString(),
      last_modified: new Date().toISOString(),
    };
  });
  return updatedCreationDate;
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
      failedItems.push(UnprocessedItems);
    }
  }

  // retry any failed entries
  if (failedItems.length) {
    const { UnprocessedItems } = await dynamoDb.batchWrite({
      RequestItems: { [questionTableName]: failedItems },
    });

    // if some still fail, add them to a list of items to be returned, return status 500
    if (UnprocessedItems.length) {
      console.error(
        `Failed to add all questions from template to question table `
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

export async function createFormTemplate(year, questions) {
  // try to stringify and parse the incoming data to verify if valid json
  let unValidatedJSON = JSON.parse(JSON.stringify(questions));

  let validatedJSON =
    unValidatedJSON && typeof unValidatedJSON === "object"
      ? unValidatedJSON
      : false;

  if (!year || !questions) {
    return {
      status: 422,
      message: `Please specify both a year and a template`,
    };
  }

  if (!unValidatedJSON) {
    return {
      status: 400,
      message: `Invalid JSON. Please review your template.`,
    };
  }

  const params = {
    TableName:
      process.env.FORM_TEMPLATES_TABLE_NAME ??
      process.env.FormTemplatesTableName,
    Item: {
      year: parseInt(year),
      template: validatedJSON,
      lastSynced: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.put(params);
    return {
      status: 200,
      message: `Template updated for ${year}!`,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: `Error adding form template to form-template table`,
    };
  }
}

// For the US Government fiscal year
// Oct-Dec = 1
// Jan-Mar = 2
// Apr-Jun = 3
// Jul-Sep = 4
export const getQuarter = (d) => {
  d = d || new Date();
  const m = Math.floor(d.getMonth() / 3) + 2;
  return m > 4 ? m - 4 : m;
};

/**
 * Generates initial form data and statuses for all states given a year and quarter
 */
export async function generateQuarterlyForms(event) {
  let noMissingForms = true;

  // at top of file, or in some config file
  const retryFailLimit = 5;
  const failureList = [];

  // Batch write all items, rerun if any UnprocessedItems are returned and it's under the retry limit
  const batchWriteAll = async (tryRetryBatch) => {
    // Attempt first batch write
    const { UnprocessedItems } = await dynamoDb.batchWrite(tryRetryBatch.batch);

    // If there are any failures and under the retry limit
    if (UnprocessedItems.length && tryRetryBatch.noOfRetries < retryFailLimit) {
      const retryBatch = {
        noOfRetries: tryRetryBatch.noOfRetries + 1,
        batch: UnprocessedItems,
      };
      return await batchWriteAll(retryBatch);
    } else if (tryRetryBatch.noOfRetries >= retryFailLimit) {
      // exceeded failure limit
      console.error(
        `Tried batch ${
          tryRetryBatch.noOfRetries
        } times. Failing batch ${JSON.stringify(tryRetryBatch)}`
      );
      failureList.push({ failure: JSON.stringify(tryRetryBatch) });
    }
  };

  const determineAgeRanges = (questionId) => {
    const year = questionId.split("-")[0];
    const form = questionId.split("-")[1];

    let ageRanges;
    if (
      parseInt(year) === 2020 ||
      parseInt(year) === 2019 ||
      parseInt(year) === 2018
    ) {
      switch (form) {
        case "GRE":
          ageRanges = [
            { key: "0018", label: "Conception through age 18 years" },
          ];
          break;
        case "21PW":
          ageRanges = [
            { key: "1964", label: "Age 19 years through age 64 years" },
          ];
          break;
        case "64.21E":
          ageRanges = [
            { key: "0001", label: "Birth through age 12 months" },
            { key: "0105", label: "Age 1 year through age 5 years" },
            { key: "0612", label: "Age 6 years through age 12 years" },
            { key: "1318", label: "Age 13 years through age 18 years" },
          ];
          break;
        case "21E":
          ageRanges = [
            { key: "0000", label: "Conception to birth" },
            { key: "0001", label: "Birth through age 12 months" },
            { key: "0105", label: "Age 1 year through age 5 years" },
            { key: "0612", label: "Age 6 years through age 12 years" },
            { key: "1318", label: "Age 13 years through age 18 years" },
          ];
          break;
        case "64.EC":
          ageRanges = [
            { key: "0001", label: "Birth through age 12 months" },
            { key: "0105", label: "Age 1 year through age 5 years" },
            { key: "0612", label: "Age 6 years through age 12 years" },
            { key: "1318", label: "Age 13 years through age 18 years" },
            { key: "1920", label: "Age 19 years through age 20 years" },
          ];
          break;
      }
    }
    return ageRanges;
  };

  // Get year and quarter from request, or the current date for automated jobs
  let specifiedYear;
  let specifiedQuarter;
  let restoreMissingAnswers = false;

  // If a data object is sent use those values.
  if (event.body && event.body !== "undefined") {
    let data =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    if (data) {
      specifiedYear = parseInt(data.year);
      specifiedQuarter = data.quarter;
      restoreMissingAnswers = !!data.restoreMissingAnswers;
    }
  }

  // If not specified, determine the reporting period from the current date.
  const currentQuarter = calculateFormQuarterFromDate(new Date());
  specifiedYear = specifiedYear || currentQuarter.year;
  specifiedQuarter = specifiedQuarter || currentQuarter.quarter;

  // Search for existing stateForms
  const foundForms = await findExistingStateForms(
    specifiedYear,
    specifiedQuarter
  );

  // Pull list of states
  let allStates = await getStatesList();

  if (!allStates.length) {
    return {
      status: 500,
      message: `Could not retrieve state list.`,
    };
  }

  // Pull list of form descriptions
  const allFormDescriptions = await getFormDescriptions();

  if (!allFormDescriptions.length) {
    return {
      status: 500,
      message: `Could not retrieve form descriptions.`,
    };
  }

  // Add All StateForm Descriptions
  const putRequestsStateForms = [];

  // Loop through all states
  for (const state in allStates) {
    // Loop through form descriptions for each state
    for (const form in allFormDescriptions) {
      // Build lengthy strings
      const stateFormString = `${allStates[state].state_id}-${specifiedYear}-${specifiedQuarter}-${allFormDescriptions[form].form}`;

      if (!foundForms.includes(stateFormString)) {
        noMissingForms = false;
        // Add item to array for batching later
        putRequestsStateForms.push({
          PutRequest: {
            Item: {
              state_form: stateFormString,
              status_date: new Date().toISOString(),
              year: specifiedYear,
              state_comments: [{ type: "text_multiline", entry: "" }],
              form_id: allFormDescriptions[form].form_id,
              last_modified_by: "seed",
              status_modified_by: "seed",
              created_by: "seed",
              validation_percent: "0.03",
              status_id: 2,
              form: allFormDescriptions[form].form,
              program_code: "All",
              state_id: allStates[state].state_id,
              not_applicable: false,
              created_date: new Date().toISOString(),
              form_name: allFormDescriptions[form].form_name,
              last_modified: new Date().toISOString(),
              quarter: specifiedQuarter,
              status: "In Progress",
            },
          },
        });
      }
    }
  }

  // Begin batching by groups of 25
  const batchArrayFormDescriptions = [];
  const batchSize = 25;

  for (let i = 0; i < putRequestsStateForms.length; i += batchSize) {
    batchArrayFormDescriptions.push(
      putRequestsStateForms.slice(i, i + batchSize)
    );
  }

  // Generate a flat array of the state forms being added
  let stateFormsBeingGenerated = batchArrayFormDescriptions
    .map((e) => {
      return e.map((element) => {
        return element.PutRequest.Item.state_form;
      });
    })
    .flat();

  // Get tableName
  const formDescriptionTableName =
    process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName;

  // Loop through batches and write to DB
  for (let i in batchArrayFormDescriptions) {
    const batchRequest = {
      RequestItems: {
        [formDescriptionTableName]: batchArrayFormDescriptions[i],
      },
    };

    // Process this batch
    await batchWriteAll({ batch: batchRequest, noOfRetries: 0 });
  }

  // -----------------------------------------------------------------

  // Pull list of questions
  let allQuestions;

  const questionsFromQuestionTable = await getQuestionsByYear(specifiedYear);

  // If questions not found, fetch/create them from template table
  if (!questionsFromQuestionTable.length) {
    let createdQuestions = await fetchOrCreateQuestions(
      specifiedYear,
      specifiedQuarter
    );

    if (createdQuestions.status !== 200) {
      // Return error message without payload
      const { status, message } = createdQuestions;
      return { status, message };
    }
    allQuestions = createdQuestions.payload;
  } else {
    allQuestions = questionsFromQuestionTable;
  }

  // Add All StateForm Descriptions
  const putRequestsFormAnswers = [];
  const stateAnswersSet = restoreMissingAnswers ? await getAnswersSet() : null;

  // Loop through all states, then all questions to return a new record with correct state info
  for (const state in allStates) {
    // Loop through each question
    for (const question in allQuestions) {
      // Get age range array
      let ageRanges =
        allQuestions[question].age_ranges ??
        determineAgeRanges(allQuestions[question].question);
      // Loop through each age range and insert row
      for (const range in ageRanges) {
        // Get reusable values
        const currentState = allStates[state].state_id;
        const currentForm = allQuestions[question].question.split("-")[1];
        const currentAgeRangeId = ageRanges[range].key;
        const currentAgeRangeLabel = ageRanges[range].label;
        const currentQuestionNumber = allQuestions[question].question.split(
          "-"
        )[2];
        const answerEntry = `${currentState}-${specifiedYear}-${specifiedQuarter}-${currentForm}-${currentAgeRangeId}-${currentQuestionNumber}`;
        const questionID = `${specifiedYear}-${currentForm}-${currentQuestionNumber}`;
        const stateFormID = `${currentState}-${specifiedYear}-${specifiedQuarter}-${currentForm}`;

        // If the stateFormID is in the array of newly created forms, the questions/answers will be created
        // Does not consider state forms generated missing questions & answers, unless flag set on manual invocation
        const isGeneratingStateForm = stateFormsBeingGenerated.includes(
          stateFormID
        );
        const missingAnswers =
          restoreMissingAnswers && !stateAnswersSet.has(stateFormID);

        if (isGeneratingStateForm || missingAnswers) {
          noMissingForms = false;
          putRequestsFormAnswers.push({
            PutRequest: {
              Item: {
                answer_entry: answerEntry,
                age_range: currentAgeRangeLabel,
                rangeId: currentAgeRangeId,
                question: questionID,
                state_form: stateFormID,
                last_modified_by: "seed",
                created_date: new Date().toISOString(),
                rows: allQuestions[question].rows,
                last_modified: new Date().toISOString(),
                created_by: "seed",
              },
            },
          });
        }
      }
    }
  }

  // Begin batching by groups of 25
  const batchArrayFormAnswers = [];
  const batchSizeFA = 25;

  for (let i = 0; i < putRequestsFormAnswers.length; i += batchSizeFA) {
    batchArrayFormAnswers.push(
      putRequestsFormAnswers.slice(i, i + batchSizeFA)
    );
  }

  // This will only be true if neither !foundForms.includes statements pass,
  // Everything was found in the list, nothing is to be created
  if (noMissingForms) {
    const message = `All forms, for Quarter ${specifiedQuarter} of ${specifiedYear}, previously existed. No new forms added`;
    return {
      status: 204,
      message: message,
    };
  }

  // Get tableName
  const formAnswersTableName =
    process.env.FORM_ANSWERS_TABLE_NAME ?? process.env.FormAnswersTableName;

  // Loop through batches and write to DB
  for (let i in batchArrayFormAnswers) {
    const batchRequest = {
      RequestItems: {
        [formAnswersTableName]: batchArrayFormAnswers[i],
      },
    };

    // Process this batch
    await batchWriteAll({ batch: batchRequest, noOfRetries: 0 });
  }

  return { failureList, specifiedQuarter, specifiedYear };
}

/**
 * We run an automated process at the start of each quarter,
 * which generates forms for the previous quarter.
 * For example: on Jan 1 2024, we would generate forms for Oct-Dec 2023.
 * Those forms would be due for completion by Jan 31, 2024.
 *
 * A potential source of confusion is that Oct-Dec 2023 represents the
 * federal fiscal quarter 2024 Q1; a quarter ahead of what you may expect.
 * Another potential source is that we want to generate forms for the
 * _previous_ quarter, to report on data from the recent past.
 *
 * Happily, these off-by-one issues cancel each other out. So this
 * function returns the more common quarter number of the current date.
 *
 * @param { Date } date - The current date
 * @returns { Object } { year, quarter } -
 *          The Federal Fiscal Quarter for which forms should be generated
 */
export const calculateFormQuarterFromDate = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth();
  let quarter = Math.floor(month / 3) + 1;

  return { year, quarter };
};
