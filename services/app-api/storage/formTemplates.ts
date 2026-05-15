import dynamoDb from "../libs/dynamodb-lib.ts";
import { FormQuestion } from "./formQuestions.ts";

/** The shape of an object in the `form-templates` table */
export type FormTemplate = {
  year: number;
  template: FormQuestion[];
};

const TableName = process.env.FormTemplatesTable;

export const getTemplate = async (year: number) => {
  const response = await dynamoDb.get({ TableName, Key: { year } });

  return response.Item as FormTemplate | undefined;
};

export const putTemplate = async (formTemplate: FormTemplate) => {
  await dynamoDb.put({ TableName, Item: formTemplate });
};

/**
 * List all of the years in the table - and _only_ the years.
 *
 * We use ProjectionExpression to save bandwidth;
 * Dynamo still reads every item but returns only the `.year` property of each.
 */
export const scanTemplateYears = async () => {
  const response = await dynamoDb.scan({
    TableName,
    ProjectionExpression: "#year",
    ExpressionAttributeNames: { "#year": "year" },
  });
  const items = (response.Items ?? []) as { year: number }[];

  return items.map((i) => i.year);
};
