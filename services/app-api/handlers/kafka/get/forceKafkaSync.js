import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import chunk from "lodash/chunk";

const scanTable = async (
    tableName,
    startingKey,
    keepSearching,
) => {
    let results = await dynamoDb.scan({
        TableName: tableName,
        ExclusiveStartKey: startingKey,
    });
    if (results.LastEvaluatedKey) {
        startingKey = results.LastEvaluatedKey;
        return [startingKey, keepSearching, results];
    } else {
        keepSearching = false;
        return [null, keepSearching, results];
    }
};

const mergeLastSynced =
    (items, syncDateTime) => items.map(item => ({ ...item, lastSynced: syncDateTime }));

const batchWrite = async (tableName, items) => {
    console.log(`Performing batchwrite for ${items.length}. Table: ${tableName}`);
    // split items into chunks of 25
    const itemChunks = chunk(items, 25);
    console.log(`Items split into ${itemChunks.length} chunks of 25 items`);
    for (const index in itemChunks) {
        // Construct the request params for batchWrite
        const itemArray = itemChunks[index].map(item => {
            return {
                PutRequest: {
                    Item: item
                }
            };
        });

        let requestItems = {};
        requestItems[tableName] = itemArray;

        const params = {
            RequestItems: requestItems
        };
        console.log('Performing batchWrite...');
        const { UnprocessedItems } = await dynamoDb.batchWrite(params);

        console.log(`BatchWrite ran with ${UnprocessedItems.length ?? 0} numbers of failed record updates`);

        if ((UnprocessedItems.length ?? 0) > 0) {
            const keys = UnprocessedItems.map(item => item[Object.keys(item)[0]]);
            console.log(`Unprocessed records for the table ${tableName} with keys ${keys}`);
        }
    }
};

const getTableNames = () => {
    let tableNames = [];
    tableNames.push(process.env.AgeRangesTableName);
    tableNames.push(process.env.FormAnswersTableName);
    tableNames.push(process.env.FormQuestionsTableName);
    tableNames.push(process.env.FormsTableName);
    tableNames.push(process.env.FormTemplatesTableName);
    tableNames.push(process.env.StateFormsTableName);
    tableNames.push(process.env.StatesTableName);
    tableNames.push(process.env.StatusTableName);
    tableNames.push(process.env.AuthUserTableName);
    return tableNames;
};

export const main = handler(async (event, context) => {
    if (event.source === "serverless-plugin-warmup") return null;
    const syncDateTime = new Date().toISOString();
    const tableNames = getTableNames();

    for (const tableName of tableNames) {
        console.log(`Starting to scan table ${tableName}`);
        let startingKey;

        let keepSearching = true;
        // Looping to perform complete scan of tables due to 1 mb limit per iteration
        while (keepSearching == true) {

            let data;
            try {
                [startingKey, keepSearching, data] =
                    await scanTable(
                        tableName,
                        startingKey,
                        keepSearching,
                    );
            }
            catch (err) {
                // console.log(`Database scan failed for the table ${tableName}
                // with startingKey ${startingKey} and the keepSearching flag is ${keepSearching}`);
                continue;
            }

            // Add lastSynced date time field
            const updatedItems = mergeLastSynced(data.Items, syncDateTime);
            try {
                await batchWrite(tableName, updatedItems);
            }
            catch (e) {
                console.log(`BatchWrite failed with exception ${e}`);
            }
        }
    }
});