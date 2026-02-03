import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { ok } from "../../libs/response-lib.ts";

const tableNames = [
  process.env.FormAnswersTable,
  process.env.FormQuestionsTable,
  process.env.FormTemplatesTable,
  process.env.StateFormsTable,
  process.env.AuthUserTable,
] as string[];

const mergeLastSynced = (items: any[], syncDateTime: string) =>
  items.map((item: any) => ({ ...item, lastSynced: syncDateTime }));

export const main = handler(async (event) => {
  const syncDateTime = new Date().toISOString();

  for (const tableName of tableNames) {
    console.log(`Starting to scan table ${tableName}`);
    let data;

    try {
      data = await dynamoDb.scan({
        TableName: tableName,
      });
    } catch (err) {
      console.error(`Database scan failed for the table ${tableName}
                    Error: ${err}`);
      throw err;
    }

    // Add lastSynced date time field
    const updatedItems = mergeLastSynced(data.Items, syncDateTime);
    try {
      await dynamoDb.putMultiple(tableName, updatedItems, JSON.stringify);
    } catch (e) {
      console.error(`BatchWrite failed with exception ${e}`);
      throw e;
    }
  }

  return ok();
});
