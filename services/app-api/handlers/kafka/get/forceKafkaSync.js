import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
// import chunk from "lodash/chunk";

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

// const batchWrite = async (tableName, items) => {

//     const itemChunks = chunk(items, 25);
//     for (const chunk in itemChunks) {

//         const itemArray = chunk.map(item => {
//             // add item.lastSynced = current time with reqd format
//             return {
//                 PutRequest: {
//                     Item: item
//                 }
//             };
//         });

//         let requestItems = {};
//         requestItems[tableName] = itemArray;
//         const params = {
//             RequestItems: requestItems
//         };
//         const { UnprocessedItems } = await dynamoDb.batchWrite(params);
//         // Todo: process UnprocessedItems
//         let failedItems = [];
//         for (const item of items) {
//             const { UnprocessedItems } = await dynamoDb.batchWrite({
//                 RequestItems: {
//                     tableName: [
//                         {
//                             PutRequest: {
//                                 Item: item
//                             }
//                         }
//                     ]
//                 },
//             });
//             // If some questions fail to write, add them to a list of failures
//             if (UnprocessedItems.length) {
//                 failedItems.push(UnprocessedItems);
//             }
//         }

//         // // retry any failed entries
//         // if (failedItems.length) {
//         //     const { UnprocessedItems } = await dynamoDb.batchWrite(tableName, {
//         //         RequestItems: { [questionTableName]: failedItems },
//         //     });

//         //     // if some still fail, add them to a list of items to be returned, return status 500
//         //     if (UnprocessedItems.length) {
//         //         console.error(
//         //             `Failed to add all questions from template to question table `
//         //         );
//         //     }
//     }
// };

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

    const tableNames = getTableNames();
    console.log('-------------------------------------------------------------------');
    dynamoDb.listTables({}, l => console.log(l));
    // Todo: Check if all table has a trigger with postKafkaData as part of its name

    for (const tableName of tableNames) {

        let startingKey;

        let keepSearching = true;

        while (keepSearching == true) {
            let items = [];
            [startingKey, keepSearching, items] =
                await scanTable(
                    tableName,
                    startingKey,
                    keepSearching,
                );
            const count = items.length;
            console.log('item count: ', count, ' last item: ', JSON.stringify(items(count - 1)));
            // addLastSynced(items);
            // await batchWrite(tableName, items);
        }
    }

    // const addLastSynced = items => {

    // }
});