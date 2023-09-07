import AWS from "aws-sdk";

const dyanmoConfig = {};

// ugly but OK, here's where we will check the environment
const endpoint = process.env.DYNAMODB_URL;
if (endpoint) {
  dyanmoConfig.endpoint = endpoint;
  dyanmoConfig.accessKeyId = "LOCALFAKEKEY";
  dyanmoConfig.secretAccessKey = "LOCALFAKESECRET";
} else {
  dyanmoConfig["region"] = "us-east-1";
}

const database = new AWS.DynamoDB();

const client = new AWS.DynamoDB.DocumentClient(dyanmoConfig);

export default {
  get: (params) => client.get(params).promise(),
  put: (params) => client.put(params).promise(),
  query: (params) => client.query(params).promise(),
  update: (params) => client.update(params).promise(),
  delete: (params) => client.delete(params).promise(),
  scan: async (params) => {
    const items = [];
    let complete = false;
    while (!complete) {
      const result = await client.scan(params).promise();
      items.push(...result.Items);
      params.ExclusiveStartKey = result.LastEvaluatedKey;
      complete = result.LastEvaluatedKey === undefined;
    }
    return { Items: items, Count: items.length };
  },
  scanMapToSet: async (params, mapFunction) => {
    let itemSet = new Set();
    let complete = false;
    while (!complete) {
      const result = await client.scan(params).promise();
      if (!result.Items) continue;

      itemSet = new Set([
        ...itemSet,
        ...result.Items.map((x) => mapFunction(x)),
      ]);

      params.ExclusiveStartKey = result.LastEvaluatedKey;
      complete = result.LastEvaluatedKey === undefined;
    }
    return itemSet;
  },
  batchWrite: (params) => client.batchWrite(params).promise(),
  listTables: (params) => database.listTables(params).promise(),
};
