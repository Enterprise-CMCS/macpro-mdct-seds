import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { authorizeAdminOrUserForState } from "../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { notFound, ok } from "../../libs/response-lib.ts";

export const main = handler(async (event: APIGatewayProxyEvent) => {
  const { state, year, quarter, form } = event.pathParameters!;

  await authorizeAdminOrUserForState(event, state);

  const state_form = `${state}-${year}-${parseInt(quarter!)}-${form}`;

  const stateFormParams = {
    TableName: process.env.StateFormsTable,
    Key: { state_form },
  };
  const statusData = (await dynamoDb.get(stateFormParams)).Item;

  if (!statusData) {
    return notFound(`Could not find form with ID ${state_form}`);
  }

  const answerParams = {
    TableName: process.env.FormAnswersTable,
    IndexName: "state-form-index",
    KeyConditionExpression: "state_form = :state_form",
    ExpressionAttributeValues: {
      ":state_form": state_form,
    },
  };
  const answers = (await dynamoDb.query(answerParams)).Items;

  const questionParams = {
    TableName: process.env.FormQuestionsTable,
    FilterExpression: "form = :form and #year = :year",
    ExpressionAttributeNames: {
      "#year": "year",
    },
    ExpressionAttributeValues: {
      ":year": parseInt(year!),
      ":form": form,
    },
  };
  const questions = (await dynamoDb.scan(questionParams)).Items;

  return ok({ statusData, questions, answers });
});
