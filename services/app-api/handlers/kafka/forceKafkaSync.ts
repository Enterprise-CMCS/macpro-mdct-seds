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

  return "Success!";
};
