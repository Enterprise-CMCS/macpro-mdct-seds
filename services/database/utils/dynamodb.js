const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const buildDynamoClient = () => {
  const dynamoConfig = {
    logger: {
      debug: console.debug,
      error: console.error,
      info: console.info,
      warn: console.warn,
    },
    region: "us-east-1",
  };

  const bareBonesClient = new DynamoDBClient(dynamoConfig);
  return DynamoDBDocumentClient.from(bareBonesClient);
};

let dynamoClient = buildDynamoClient();

const scan = async (scanParams) => {
  let ExclusiveStartKey;
  let items = [];

  do {
    const command = new ScanCommand({ ...scanParams, ExclusiveStartKey });
    const result = await dynamoClient.send(command);
    items = items.concat(result.Items ?? []);
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
};

const update = async (tableName, items) => {
  try {
    for (const item of items) {
      const params = {
        TableName: tableName,
        Item: {
          ...item,
        },
      };

      const command = new PutCommand(params);
      await dynamoClient.send(command);
    }
    console.log(`Touched ${items.length} in table ${tableName}`);
  } catch (e) {
    console.log(` -- ERROR UPLOADING ${tableName}\n`, e);
  }
};

module.exports = { buildDynamoClient, scan, update };
