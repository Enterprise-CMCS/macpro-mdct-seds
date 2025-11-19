import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";

const tableNames = [
  process.env.FormAnswersTable,
  process.env.FormQuestionsTable,
  process.env.FormTemplatesTable,
  process.env.StateFormsTable,
  process.env.StatesTable,
  process.env.AuthUserTable,
];

const mergeLastSynced = (items, syncDateTime) =>
  items.map((item) => ({ ...item, lastSynced: syncDateTime }));

const batchWrite = async (tableName, items) => {
  console.log(
    `Performing batchwrite for ${items.length} items in table: ${tableName}`
  );
  const itemChunks = [...batchItemsIntoGroupsOfTwentyFive(items)];
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

function* batchItemsIntoGroupsOfTwentyFive(items) {
  /** This is the max number of requests in a DynamoDB BatchWriteCommand */
  const TWENTY_FIVE = 25;
  for (let index = 0; index < items.length; index += TWENTY_FIVE) {
    yield items.slice(index, index + TWENTY_FIVE);
  }
}
