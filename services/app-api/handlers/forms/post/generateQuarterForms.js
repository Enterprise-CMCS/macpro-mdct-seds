import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import {
  getFormDescriptions,
  getFormResultByStateString,
  getQuestionsByYear,
  getStatesList,
} from "../../shared/sharedFunctions";

/**
 * Generates initial form data and statuses for all states given a year and quarter
 */

export const main = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  // at top of file, or in some config file
  const retryFailLimit = 5;

  // Batchw rite all items, rerun ij any UnprocessedItems are returned and it's under the retry limit
  const batchWriteAll = async (tryRetryBatch) => {
    // Attempt first batch write
    const { UnprocessedItems } = await dynamoDb.batchWrite(tryRetryBatch);

    // If there are any failures and under the retry limit
    if (UnprocessedItems.length && tryRetryBatch.noOfRetries < retryFailLimit) {
      const retryBatch = {
        noOfRetries: tryRetryBatch.noOfRetries + 1,
        batch: tryRetryBatch,
      };
      return await batchWriteAll(retryBatch);
    } else if (tryRetryBatch.noOfRetries < retryFailLimit) {
      // exceeded failure limit
      console.error(
        `Tried batch ${
          tryRetryBatch.noOfRetries
        } times. Failing batch ${JSON.stringify(tryRetryBatch)}`
      );
      return {
        status: 500,
        message: `A failure occurred while writing data.`,
      };
    }
  };

  // Get year and quarter from request
  let data = JSON.parse(event.body);

  const specifiedYear = data.year.value;
  const specifiedQuarter = data.quarter.value;

  // Quick check to see if form answers already exist for year and quarter
  // Use Alabama form 21E as a basic check
  const stateFormString = `AL-${specifiedYear}-${specifiedQuarter}-21E`;
  let currentForms = await getFormResultByStateString(stateFormString);

  // if length > 0 send error response
  if (currentForms.length > 0) {
    return {
      status: 409,
      message: `This process has been halted. Forms exists for Quarter ${specifiedQuarter} of ${specifiedYear}`,
    };
  }

  // Pull list of questions
  let allQuestions = await getQuestionsByYear(specifiedYear);

  // If questions not found, return failure message
  if (!allQuestions.length) {
    return {
      status: 500,
      message: `Could not find template for generating forms for ${specifiedYear}`,
    };
  }

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
            form_name: allFormDescriptions[form].label,
            last_modified: new Date().toISOString(),
            quarter: specifiedQuarter,
            status: "In Progress",
          },
        },
      });
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
    await batchWriteAll(batchRequest);
  }

  // Add All StateForm Descriptions
  const putRequestsFormAnswers = [];

  // Loop through all states, then all questions to return a new record with correct state info
  for (const state in allStates) {
    // Loop through each question
    for (const question in allQuestions) {
      // Get age range array
      let ageRanges = allQuestions[question].age_ranges;

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

  // Begin batching by groups of 25
  const batchArrayFormAnswers = [];
  const batchSizeFA = 25;
  for (let i = 0; i < putRequestsFormAnswers.length; i += batchSizeFA) {
    batchArrayFormAnswers.push(
      putRequestsFormAnswers.slice(i, i + batchSizeFA)
    );
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
    await batchWriteAll(batchRequest);
  }

  return {
    status: 200,
    message: `Forms successfully created for Quarter ${specifiedQuarter} of ${specifiedYear}`,
  };
});
