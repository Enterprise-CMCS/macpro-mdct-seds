import dynamoDb from "../libs/dynamodb-lib.ts";

/** The shape of an object in the `form-questions` table */
export type FormQuestion = {
  /**
   * Format: `year-form-questionNumber`
   * @example "2025-21E-05"
   */
  question: string;
  age_ranges?: {
    /**
     * A four-character identifier
     * @example "0105"
     */
    key: string;
    /**
     * Short description.
     * @example "Ages 1 - 5"
     */
    label: string;
  }[];
  rows: any[];
};

const TableName = process.env.FormQuestionsTable;

export const scanQuestionsByYear = async (year: number) => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression: "#year = :year",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: { ":year": year },
  });

  return response.Items as FormQuestion[];
};

export const scanQuestionsByYearAndForm = async (
  year: number,
  form: string
) => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression: "#year = :year AND form = :form",
    ExpressionAttributeNames: {
      "#year": "year",
    },
    ExpressionAttributeValues: {
      ":year": year,
      ":form": form,
    },
  });
  return response.Items as FormQuestion[];
};

export const writeAllFormQuestions = async (questions: FormQuestion[]) => {
  await dynamoDb.putMultiple(
    TableName!,
    questions,
    (question) => question.question
  );
};
