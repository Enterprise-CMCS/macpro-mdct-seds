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

export const scanQuestionsByYear = async (year: number) => {
  const response = await dynamoDb.scan({
    TableName: process.env.FormQuestionsTable,
    FilterExpression: "#year = :year",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: { ":year": year },
  });

  return response.Items as FormQuestion[];
};

export const writeAllFormQuestions = async (questions: FormQuestion[]) => {
  await dynamoDb.putMultiple(
    process.env.FormQuestionsTable!,
    questions,
    question => question.question
  );
};
