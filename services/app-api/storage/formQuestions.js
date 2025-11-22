import dynamoDb from "../libs/dynamodb-lib.js";

/**
 * @param {number} year
 * @returns {Promise<object[]>}
 */
export const scanQuestionsByYear = async (year) => {
  const response = await dynamoDb.scan({
    TableName: process.env.FormQuestionsTable,
    FilterExpression: "#year = :year",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: { ":year": year },
  });

  return response.Items;
};


export const writeAllFormQuestions = async (questions) => {
  await dynamoDb.putMultiple(
    process.env.FormQuestionsTable,
    questions,
    question => question.question
  );
};
