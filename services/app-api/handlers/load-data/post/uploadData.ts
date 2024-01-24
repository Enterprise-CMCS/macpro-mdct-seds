import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

import { parse } from "lambda-multipart-parser";

export const main = handler(async (event, context) => {
  const formData = await parse(event);
  const targetTable = formData["targetTable"];

  let dataSlice = event.body
    .toString()
    .slice(event.body.toString().indexOf("application/json"))
    .replace("application/json", "");

  const dataToUpload = JSON.parse(dataSlice.slice(0, dataSlice.indexOf("---")));

  await uploadData(targetTable, dataToUpload);
});

// TODO this should probably be a Dynamo Batch Write
const uploadData = async (targetTable, dataToUpload) => {
  for (let record of dataToUpload) {
    // Updating lastSynced
    record = { ...record, lastSynced: new Date().toISOString() };
    console.log("\n\n!!!> loading record:");
    console.log(record);

    const params = {
      TableName: targetTable,
      Item: record,
    };

    try {
      const result = await dynamoDb.put(params);
      console.log("\n+++ record successfully saved: ");
      console.log(result);
    }
    catch (error) {
      console.log("\n\n*** ERROR LOADING DATA: ");
      console.log(error);
    }
  }
};
