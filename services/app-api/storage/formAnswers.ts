import dynamoDb from "../libs/dynamodb-lib.ts";

/**
 * Scan the entire table, and return all form IDs.
 *
 * This is called when repairing form answers for a quarter.
 * If a form ID has no answers, that's one of the forms that needs repair.
 *
 * TODO: This is probably the worst-performing database operation in the app,
 * because FormAnswers is our largest table, and it will get worse every year.
 * We should probably index the table by year, so that this can be a Query.
 * @returns {Promise<string[]>}
 */
export const scanForAllFormIds = async () => {
  const response = await dynamoDb.scan({
    TableName: process.env.FormAnswersTable,
    ProjectionExpression: "state_form"
  });

  return response.Items.map(answer => answer.state_form);
};

/**
 * @param {object[]} answers
 */
export const writeAllFormAnswers = async (answers) => {
  await dynamoDb.putMultiple(
    process.env.FormAnswersTable,
    answers,
    answer => answer.answer_entry
  );
};
