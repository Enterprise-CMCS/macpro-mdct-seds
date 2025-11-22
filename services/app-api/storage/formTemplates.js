import dynamoDb from "../libs/dynamodb-lib.js";

/**
 * @param {number} year 
 * @returns {Promise<object|undefined>}
 */
export const getTemplate = async (year) => {
  const response = await dynamoDb.get({
    TableName: process.env.FormTemplatesTable,
    Key: { year },
  });

  return response.Item;
};

export const putTemplate = async (formTemplate) => {
  await dynamoDb.put({
    TableName: process.env.FormTemplatesTable,
    Item: formTemplate,
  });
};
