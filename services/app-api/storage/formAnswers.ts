import dynamoDb from "../libs/dynamodb-lib.ts";
import { DateString } from "../shared/types.ts";
import { FormQuestion } from "./formQuestions.ts";
import { StateForm } from "./stateForms.ts";

/** The shape of an object in the `form-answers` table */
export type FormAnswer = {
  // Identifier fields
  /**
   * Format `state-year-quarter-form-ageRangeId-questionNumber`.
   * @example "CO-2025-4-21E-0105-05"
   */
  answer_entry: string;
  state_form: StateForm["state_form"];
  question: FormQuestion["question"];
  /**
   * Age range identifier
   * @example "0105"
   */
  rangeId: string;

  // Data fields
  /**
   * Generally, the first object in this array will contain column headers,
   * and subsequent objects will contain data, with col1 being a row header.
   *
   * But this varies from form to form, and question to question.
   * The column headers may relate to income or enrollment types.
   * The row headers may be service types, genders, races, or ethnicities.
   * And the data may be primitives, or objects containing JSONPath formulas.
   */
  rows: {
    col1: any;
    col2: any;
    col3: any;
    col4: any;
    col5: any;
    col6: any;
  }[];

  // Redundant fields
  /**
   * Short description.
   * @example "Ages 1 - 5"
   */
  age_range?: string;

  // Traceability fields
  created_date: DateString;
  created_by: "seed" | "Legacy SEDS";
  last_modified: DateString;
  last_modified_by: string;
};

const TableName = process.env.FormAnswersTable;

export const queryAnswersByForm = async (
  state_form: StateForm["state_form"]
) => {
  const response = await dynamoDb.query({
    TableName,
    IndexName: "state-form-index",
    KeyConditionExpression: "state_form = :state_form",
    ExpressionAttributeValues: {
      ":state_form": state_form,
    },
  });
  return response.Items as FormAnswer[];
};

export const queryAnswersByEntry = async (
  answer_entry: FormAnswer["answer_entry"]
) => {
  const response = await dynamoDb.query({
    TableName,
    ExpressionAttributeValues: { ":answerEntry": answer_entry },
    KeyConditionExpression: "answer_entry = :answerEntry",
  });
  return response.Items as FormAnswer[];
};

/**
 * Scan the entire table, and return all form IDs.
 *
 * This is called when repairing form answers for a quarter.
 * If a form ID has no answers, that's one of the forms that needs repair.
 *
 * TODO: This is probably the worst-performing database operation in the app,
 * because FormAnswers is our largest table, and it will get worse every year.
 * We should probably index the table by year, so that this can be a Query.
 */
export const scanForAllFormIds = async (): Promise<string[]> => {
  const response = await dynamoDb.scan({
    TableName,
    ProjectionExpression: "state_form",
  });

  return (response.Items as FormAnswer[]).map((answer) => answer.state_form);
};

export const updateAnswer = async (
  data: Pick<
    FormAnswer,
    "answer_entry" | "rows" | "last_modified" | "last_modified_by"
  >
) => {
  await dynamoDb.update({
    TableName,
    Key: { answer_entry: data.answer_entry },
    UpdateExpression:
      "SET #rows = :rows, last_modified = :last_modified, last_modified_by = :last_modified_by",
    ExpressionAttributeNames: { "#rows": "rows" },
    ExpressionAttributeValues: {
      ":rows": data.rows,
      ":last_modified": data.last_modified,
      ":last_modified_by": data.last_modified_by,
    },
  });
};

export const writeAllFormAnswers = async (answers: FormAnswer[]) => {
  await dynamoDb.putMultiple(
    TableName!,
    answers,
    (answer) => answer.answer_entry
  );
};
