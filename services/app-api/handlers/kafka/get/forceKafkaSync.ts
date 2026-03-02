import handler from "../../../libs/handler-lib.ts";
import dynamoDb from "../../../libs/dynamodb-lib.ts";
import { ok } from "../../../libs/response-lib.ts";

const tableNames = [
  process.env.FormAnswersTable,
  process.env.FormQuestionsTable,
  process.env.FormTemplatesTable,
  process.env.StateFormsTable,
  process.env.AuthUserTable,
] as string[];

const mergeLastSynced = (items: any[], syncDateTime: string) =>
  items.map((item: any) => ({ ...item, lastSynced: syncDateTime }));

export const main = handler(async (_event) => {
  const syncDateTime = new Date().toISOString();

  for (const tableName of tableNames) {
    console.log(`Starting to scan table ${tableName}`);
    let data;

    try {
      data = await dynamoDb.scan({
        TableName: tableName,
      });
    } catch (error) {
      console.error(`Database scan failed for the table ${tableName}
                    Error: ${error}`);
      throw error;
    }

    // Add lastSynced date time field
    const updatedItems = mergeLastSynced(data.Items, syncDateTime);
    try {
      await dynamoDb.putMultiple(tableName, updatedItems, JSON.stringify);
    } catch (error) {
      console.error(`BatchWrite failed with exception ${error}`);
      throw error;
    }
  }

  return ok();
});
