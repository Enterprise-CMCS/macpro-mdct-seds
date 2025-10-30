import handler from "./../../libs/handler-lib.js";
import dynamoDb from "./../../libs/dynamodb-lib.js";
import { authorizeAdminOrUserForState } from "../../auth/authConditions.js";

export const main = handler(async (event, context) => {
  // Deconstruct variables from URL string
  const { state, specifiedYear, quarter, form } = event.pathParameters;

  await authorizeAdminOrUserForState(event, state);

  const answerFormID = `${state}-${specifiedYear}-${parseInt(quarter)}-${form}`;

  const answerParams = {
    TableName: process.env.FormAnswersTable,
    IndexName: "state-form-index",
    /*
     * Select: "ALL_ATTRIBUTES",
     * ExpressionAttributeNames: {
     * "#answer_entry": "answer_entry"
     * },
     */
    ExpressionAttributeValues: {
      ":answerFormID": answerFormID,
    },
    KeyConditionExpression: "state_form = :answerFormID",
  };

  const questionParams = {
    TableName: process.env.FormQuestionsTable,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":specifiedYear": parseInt(specifiedYear),
      ":form": form,
    },
    FilterExpression: "form = :form and #theYear = :specifiedYear",
  };

  const answersResult = await dynamoDb.query(answerParams);
  const questionsResult = await dynamoDb.scan(questionParams);

  if (answersResult.Count === 0) {
    throw new Error("Answers for Single form not found.");
  }
  if (questionsResult.Count === 0) {
    throw new Error("Questions for Single form not found.");
  }

  return {
    answers: answersResult.Items,
    questions: questionsResult.Items,
  };
});
