import dynamoDb from "../libs/dynamodb-lib.ts";
import { FormQuestion } from "./formQuestions.ts";

/** The shape of an object in the `form-templates` table */
export type FormTemplate = {
  year: number;
  template: FormQuestion[];
};

export const getTemplate = async (year: number) => {
  const response = await dynamoDb.get({
    TableName: process.env.FormTemplatesTable,
    Key: { year },
  });

  return response.Item as FormTemplate | undefined;
};

export const putTemplate = async (formTemplate: FormTemplate) => {
  await dynamoDb.put({
    TableName: process.env.FormTemplatesTable,
    Item: formTemplate,
  });
};
