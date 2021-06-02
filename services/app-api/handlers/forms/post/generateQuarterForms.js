import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
/**
 * Generates initial form data for all states given a year and quarter
 */

export const main = handler(async (event, context) => {
  // *** if this invocation is a pre-warm, do nothing and return
  if (event.source === "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }

  let message;
  // Get year and quarter from request
  let data = JSON.parse(event.body);

  const specifiedYear = data.year.value;
  const specifiedQuarter = data.quarter.value;

  // Pull list of questions
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

  let allQuestions = questionResult.Items;
  // return allQuestions;

  // Pull list of states
  const stateParams = {
    TableName: process.env.STATES_TABLE_NAME ?? process.env.StatesTableName,
  };

  const stateResult = await dynamoDb.scan(stateParams);

  let allStates = stateResult.Items;

  // Pull list of form descriptions
  const formDescriptionParams = {
    TableName: process.env.FORMS_TABLE_NAME ?? process.env.FormsTableName,
  };

  const formDescription = await dynamoDb.scan(formDescriptionParams);
  const allFormDescriptions = formDescription.Items;

  // Loop through all states, then all questions to return a new record with correct state info
  for (const state in allStates) {
    // Loop through each form description and create form status record
    for (const form in allFormDescriptions) {
      // Setup params for insert
      const stateFormString = `${allStates[state].state_id}-${specifiedYear}-${specifiedQuarter}-${allFormDescriptions[form].form}`;

      const insertFormParams = {
        TableName:
          process.env.STATE_FORMS_TABLE_NAME ?? process.env.StateFormsTableName,
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
      };
      try {
        const result = await dynamoDb.put(insertFormParams);
        message = JSON.stringify(result);
      } catch (e) {
        return {
          status: 200,
          message: "A failure occurred while adding new entries",
        };
      }
    }

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

        // Setup params for insert
        const insertParams = {
          TableName:
            process.env.FORM_ANSWERS_TABLE_NAME ??
            process.env.FormAnswersTableName,
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
            created_by: "zzzz",
          },
        };
        try {
          const result = await dynamoDb.put(insertParams);
          message = JSON.stringify(result);
        } catch (e) {
          return {
            status: 200,
            message: "A failure occurred while adding new entries",
          };
        }
      }
    }
  }

  // if (result.Count === 0) {
  //   return { status: 500, message: "Forms successfully created" };
  // }
  // Return success message
  return { status: 200, message };
});
