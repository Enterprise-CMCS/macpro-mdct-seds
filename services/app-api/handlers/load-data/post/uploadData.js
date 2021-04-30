import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";

import { parse } from "lambda-multipart-parser";

export const main = handler(async (event, context) => {
  if (event.source === "serverless-plugin-warmup") return null;
  const data = await parse(event);

  console.log("*************\n\n");

  console.log(data);

  /*const tableName = data.tableName;

  await uploadData(tableName, data);*/
});

const uploadData = async (tableName, data) => {
  console.log(data);

  const records = JSON.parse(data.toString());

  records.forEach((record) => {
    console.log("\n\n!!!> loading record:");
    console.log(record);

    const params = {
      TableName: tableName,
      Item: record,
    };

    dynamoDb.put(params, (error, result) => {
      if (error) {
        console.log("\n\n*** ERROR LOADING DATA");
        console.log(error);
      } else {
        console.log("\n+++ record successfully saved");
      }
    });
  });
};

/*
const clearRecords = async (tableName) => {
  const data = await getRecords(tableName);

  data.forEach(async (item) => {
    await deleteItem(tableName, item.rangeId);
  });
};

const deleteItem = async (tableName, id) => {
  const params = {
    TableName: `${tableName}`,
    Key: {
      rangeId: `${id}`,
    },
  };

  console.log(params);
  const result = await dynamoDb.put(params);
  console.log(result);
  return true;
};

const getRecords = async (tableName) => {
  const params = {
    TableName: `${tableName}`,
  };

  const result = await dynamoDb.scan(params);

  if (!result.Items) {
    throw new Error("No records found.");
  }

  return result.Items;
};
*/
