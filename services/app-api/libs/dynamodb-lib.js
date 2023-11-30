import {
  DynamoDBClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoConfig = {};

// ugly but OK, here's where we will check the environment
const endpoint = process.env.DYNAMODB_URL;
if (endpoint) {
  dynamoConfig.endpoint = endpoint;
  dynamoConfig.accessKeyId = "LOCALFAKEKEY";
  dynamoConfig.secretAccessKey = "LOCALFAKESECRET";
} else {
  dynamoConfig["region"] = "us-east-1";
}

const baseClient = new DynamoDBClient(dynamoConfig);
const client = DynamoDBDocumentClient.from(baseClient);

export default {
  put: (params) => client.send(new PutCommand(params)),
  query: (params) => client.send(new QueryCommand(params)),
  update: (params) => client.send(new UpdateCommand(params)),
  delete: (params) => client.send(new DeleteCommand(params)),
  scan: async (params) => {
    const items = [];
    let ExclusiveStartKey;
    do {
      const result = await client.scan({ params, ExclusiveStartKey });
      items.push(...result.Items);
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey)
    return { Items: items, Count: items.length };
  },
  batchWrite: (params) => client.send(new BatchWriteCommand(params)),
  listTables: (params) => baseClient.send(new ListTablesCommand(params)),
};
