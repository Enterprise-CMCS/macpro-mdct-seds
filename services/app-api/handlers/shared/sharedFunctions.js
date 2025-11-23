import dynamoDb from "../../libs/dynamodb-lib.js";

export async function getStatesList() {
  const stateParams = {
    TableName: process.env.StatesTable,
  };

  let stateResult;

  try {
    stateResult = await dynamoDb.scan(stateParams);
  } catch (e) {
    console.log("getStatesList failed");
    throw e;
  }

  return stateResult.Items;
}
