import dynamoDb from "../libs/dynamodb-lib.js";

/**
 * Scan the entire table, and return all form IDs.
 *
 * This is called when repairing form answers for a quarter.
 * If a form ID has no answers, that's one of the forms that needs repair.
 * @returns {Promise<string[]>}
 */
export const scanForAllFormIds = async () => {
  const response = await dynamoDb.scan({
    TableName: process.env.FormAnswersTable,
    ProjectionExpression: "state_form"
  });

  return response.Items.map(answer => answer.state_form);
};
