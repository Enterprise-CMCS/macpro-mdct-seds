import dynamoDb from "../../libs/dynamodb-lib.ts";

const tableNames = [
  process.env.FormAnswersTable,
  process.env.FormQuestionsTable,
  process.env.FormTemplatesTable,
  process.env.StateFormsTable,
  process.env.AuthUserTable,
] as string[];

const mergeLastSynced = (items: any[], syncDateTime: string) =>
  items.map((item: any) => ({ ...item, lastSynced: syncDateTime }));

/**
 * Only called manually, via the AWS web UI. We will not have a user token,
 * so we cannot (and don't need to) use the standard `handler()` wrapper.
 */
export const main = async () => {
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

  return "Success!";
};
