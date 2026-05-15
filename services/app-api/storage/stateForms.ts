import dynamoDb from "../libs/dynamodb-lib.ts";
import { DateString, FormStatusValue } from "../shared/types.ts";

/** The shape of an object in the `state-forms` table */
export type StateForm = {
  // Identifier fields
  /**
   * Format `state-year-quarter-form`.
   * @example "CO-2025-4-21E"
   */
  state_form: string;
  /**
   * Two-letter state abbreviation.
   * @example "CO"
   */
  state_id: string;
  /** @example 2025 */
  year: number;
  /** @example 4 */
  quarter: number;
  /** @example "21E" */
  form: string;

  // Data fields
  status_id: FormStatusValue;
  state_comments: [{ type: "text_multiline"; entry: string | null }];
  /** Present only for 21E and 64.21E forms, and only for Q4. */
  enrollmentCounts?: {
    /** Separate for 21E, Expansion for 64.21E */
    type: "separate" | "expansion";
    /** Redundant with StateForm.year */
    year: number;
    /** The sum of all numbers entered for Question 7. */
    count: number;
  };

  // Redundant fields
  /**
   * Correlates to the `form` and `form_name`.
   * @example "1"
   */
  form_id: `${number}` | number;
  /** @xample "Number of Children Served in Separate CHIP Program" */
  form_name: string;
  /** Managed by the SummaryNotes component on the frontend. */
  program_code: "All";
  validation_percent: "0.03" | 0.03;

  // Traceability fields
  status_date: DateString;
  status_modified_by: string;
  created_date: DateString;
  created_by: "seed" | "Legacy SEDS";
  last_modified: DateString;
  last_modified_by: string;
};

const TableName = process.env.StateFormsTable;

export const scanFormsByState = async (state: string) => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression: "state_id = :stateId",
    ExpressionAttributeValues: { ":stateId": state },
    ConsistentRead: true,
  });

  return response.Items as StateForm[];
};

export const scanFormsByStateAndQuarter = async (
  state: string,
  year: number,
  quarter: number
) => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression:
      "state_id = :state and quarter = :quarter and #year = :year",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":state": state,
      ":year": year,
      ":quarter": quarter,
    },
  });
  return response.Items as StateForm[];
};

export const scanFormsByQuarter = async (year: number, quarter: number) => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression: "#year = :year AND quarter = :quarter",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":year": year,
      ":quarter": quarter,
    },
  });
  return response.Items as StateForm[];
};

export const scanFormsByQuarterAndStatus = async (
  year: number,
  quarter: number,
  status_id: FormStatusValue
) => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression:
      "#year = :year AND quarter = :quarter AND status_id = :status_id",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":year": year,
      ":quarter": quarter,
      ":status_id": status_id,
    },
  });
  return response.Items as StateForm[];
};

/**
 * Scan for ALL state forms (any year) which contain annual enrollment totals.
 *
 * That means only 21E and 64.21E; other forms do not have such totals.
 * It also means only Q4 forms; the totals are only calculated at year end.
 */
export const scanStateFormsWithTotals = async () => {
  const response = await dynamoDb.scan({
    TableName,
    FilterExpression: "quarter = :quarter AND form IN (:f1, :f2)",
    ExpressionAttributeValues: {
      ":quarter": 4,
      ":f1": "21E",
      ":f2": "64.21E",
    },
    ConsistentRead: true,
  });
  return response.Items as StateForm[];
};

export const getStateForm = async (state_form: StateForm["state_form"]) => {
  const response = await dynamoDb.get({
    TableName: process.env.StateFormsTable,
    Key: { state_form },
  });
  return response.Item as StateForm | undefined;
};

export const updateEnrollmentCounts = async (
  data: Pick<
    StateForm,
    "state_form" | "last_modified" | "last_modified_by" | "enrollmentCounts"
  >
) => {
  await dynamoDb.update({
    TableName: process.env.StateFormsTable,
    Key: { state_form: data.state_form },
    UpdateExpression:
      "SET last_modified = :last_modified, last_modified_by = :last_modified_by, enrollmentCounts = :enrollmentCounts",
    ExpressionAttributeValues: {
      ":last_modified": data.last_modified,
      ":last_modified_by": data.last_modified_by,
      ":enrollmentCounts": data.enrollmentCounts,
    },
  });
};

export const updateComment = async (
  data: Pick<
    StateForm,
    "state_form" | "state_comments" | "last_modified" | "last_modified_by"
  >
) => {
  await dynamoDb.update({
    TableName,
    Key: { state_form: data.state_form },
    UpdateExpression:
      "SET state_comments = :state_comments, last_modified = :last_modified, last_modified_by = :last_modified_by",
    ExpressionAttributeValues: {
      ":state_comments": data.state_comments,
      ":last_modified": data.last_modified,
      ":last_modified_by": data.last_modified_by,
    },
  });
};

/**
 * Update `state_comments`, `status_id`, and associated traceability fields.
 *
 * Only call this method if status *has actually changed*,
 * because it *will* update `status_modified` and `status_modified_by`.
 */
export const updateCommentAndStatus = async (
  data: Pick<
    StateForm,
    | "state_form"
    | "state_comments"
    | "status_id"
    | "last_modified"
    | "last_modified_by"
  >
) => {
  await dynamoDb.update({
    TableName,
    Key: { state_form: data.state_form },
    UpdateExpression:
      "SET state_comments = :state_comments, last_modified = :last_modified, last_modified_by = :last_modified_by, status_id = :status_id, status_date = :status_date, status_modified_by = :status_modified_by",
    ExpressionAttributeValues: {
      ":state_comments": data.state_comments,
      ":last_modified": data.last_modified,
      ":last_modified_by": data.last_modified_by,
      ":status_id": data.status_id,
      ":status_modified": data.last_modified,
      ":status_modified_by": data.last_modified_by,
    },
  });
};

export const writeAllStateForms = async (forms: StateForm[]) => {
  await dynamoDb.putMultiple(
    process.env.StateFormsTable!,
    forms,
    (form) => form.state_form
  );
};
