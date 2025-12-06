import dynamoDb from "../libs/dynamodb-lib.ts";
import {
  DateString,
  FormStatusValue
} from "../shared/types.ts";

/** The shape of an object in the `state-forms` table */
export type StateForm = {
  // Identifier fields
  /**
   * Format `state-year-quarter-form`.
   * @xample "CO-2025-4-21E"
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
  state_comments: [{ type: "text_multiline", entry: string | null }];

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

export const scanFormsByQuarter = async (year: number, quarter: number) => {
  const response = await dynamoDb.scan({
    TableName: process.env.StateFormsTable,
    FilterExpression: "#year = :year AND quarter = :quarter",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":year": year,
      ":quarter": quarter,
    },
  });
  return response.Items as StateForm[];
};

export const scanFormsByQuarterAndStatus = async (year: number, quarter: number, status_id: number) => {
  const response = await dynamoDb.scan({
    TableName: process.env.StateFormsTable,
    FilterExpression: "#year = :year AND quarter = :quarter AND status_id = :status_id",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":year": year,
      ":quarter": quarter,
      ":status_id": status_id,
    },
  });
  return response.Items as StateForm[];
};

export const writeAllStateForms = async (forms: StateForm[]) => {
  await dynamoDb.putMultiple(
    process.env.StateFormsTable!,
    forms,
    form => form.state_form
  );
};
