import handler from "./../../libs/handler-lib";
import dynamoDb from "./../../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
  // If this invokation is a prewarm, do nothing and return.
  if (event.source == "serverless-plugin-warmup") {
    console.log("Warmed up!");
    return null;
  }
  // Deconstruct variables from URL string
  const { state, specifiedYear, quarter, form } = event.pathParameters;

  const answerFormID = `${state}-${specifiedYear}-${parseInt(quarter)}-${form}`;

  const answerParams = {
    TableName: process.env.FORM_ANSWERS_TABLE_NAME,
    Select: "ALL_ATTRIBUTES",
    ExpressionAttributeValues: {
      ":answerFormID": answerFormID,
    },
    FilterExpression: "state_form = :answerFormID",
  };

  const questionParams = {
    TableName: process.env.FORM_QUESTIONS_TABLE_NAME,
    ExpressionAttributeNames: {
      "#theYear": "year",
    },
    ExpressionAttributeValues: {
      ":specifiedYear": parseInt(specifiedYear),
      ":form": form,
    },
    FilterExpression: "form = :form and #theYear = :specifiedYear",
  };

  const [answersResult, questionResult] = await Promise.all([
    dynamoDb.scan(answerParams),
    dynamoDb.scan(questionParams),
  ]);

  if (answersResult.Count === 0) {
    throw new Error("Answers for Single form not found.");
  }
  if (questionResult.Count === 0) {
    throw new Error("Questions for Single form not found.");
  }

  return {
    answers: answersResult.Items,
    questions: questionResult.Items,
  };
});
