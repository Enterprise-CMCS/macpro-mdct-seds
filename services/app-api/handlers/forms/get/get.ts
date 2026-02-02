import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { authorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../../shared/types.ts";
import { ok } from "../../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  const { state, year, quarter, form } = event.pathParameters!;

  await authorizeAdminOrUserForState(event, state);

  const answerFormID = `${state}-${year}-${parseInt(quarter!)}-${form}`;

  const answerParams = {
    TableName: process.env.FormAnswersTable,
    IndexName: "state-form-index",
    /*Select: "ALL_ATTRIBUTES",
    ExpressionAttributeNames: {
      "#answer_entry": "answer_entry"
    },*/
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
      ":year": parseInt(year!),
      ":form": form,
    },
    FilterExpression: "form = :form and #theYear = :year",
  };

  const answersResult = await dynamoDb.query(answerParams);
  const questionsResult = await dynamoDb.scan(questionParams);

  if (answersResult.Count === 0) {
    throw new Error("Answers for Single form not found.");
  }
  if (questionsResult.Count === 0) {
    throw new Error("Questions for Single form not found.");
  }

  return ok({
    answers: answersResult.Items,
    questions: questionsResult.Items,
  });
});
