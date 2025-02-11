import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import chunk from "lodash/chunk";

const tableNames = [
  process.env.AGE_RANGES_TABLE,
  process.env.FORM_ANSWERS_TABLE,
  process.env.FORM_QUESTIONS_TABLE,
  process.env.FORMS_TABLE,
  process.env.FORM_TEMPLATES_TABLE,
  process.env.STATE_FORMS_TABLE,
  process.env.STATES_TABLE,
  process.env.STATUS_TABLE,
  process.env.AUTH_USER_TABLE,
];

const mergeLastSynced = (items, syncDateTime) =>
  items.map((item) => ({ ...item, lastSynced: syncDateTime }));

const batchWrite = async (tableName, items) => {
  console.log(
    `Performing batchwrite for ${items.length} items in table: ${tableName}`
  );
  // split items into chunks of 25
  const itemChunks = chunk(items, 25);
  console.log(
    `Items split into ${itemChunks.length} chunk(s) of not more than 25 items`
  );
  for (const index in itemChunks) {
    // Construct the request params for batchWrite
    const itemArray = itemChunks[index].map((item) => {
      return {
        PutRequest: {
          Item: item,
        },
      };
    });

    let requestItems = {};
    requestItems[tableName] = itemArray;

    const params = {
      RequestItems: requestItems,
    };

    const { FailedItems } = await dynamoDb.batchWriteItem(params);
    console.log(`BatchWrite performed for ${itemArray.length} items`);
    if ((FailedItems?.length ?? 0) > 0) {
      const keys = FailedItems.map((item) => item[Object.keys(item)[0]]);
      console.log(
        `BatchWrite ran with ${
          FailedItems.length ?? 0
        } numbers of failed item updates`
      );
      console.log(
        `The following items failed updating for the table ${tableName} -  keys ${keys}`
      );
    }
  }
};

export const main = handler(async (event, context) => {
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
      await batchWrite(tableName, updatedItems);
    } catch (e) {
      console.error(`BatchWrite failed with exception ${e}`);
      throw e;
    }
  }
});
