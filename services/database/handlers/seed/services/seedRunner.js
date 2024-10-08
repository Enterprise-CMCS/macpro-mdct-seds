const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");

let dynamoClient;
let dynamoPrefix;

const runSeed = async (seedInstructions) => {
  const { name, filenames, tableNameBuilder, keys } = seedInstructions;
  for (const filename of filenames) {
    const tableName = tableNameBuilder(dynamoPrefix);
    if (!filenames || filenames <= 0) continue;
    const file = require(filename);
    const data = file.constructor.name == "Array" ? file : [file];
    if (!data || data.length <= 0) continue;

    await updateItems(tableName, data, keys);
  }
};

const updateItems = async (tableName, items, keys) => {
  try {
    for (const item of items) {
      let key = {};
      for (const k of keys) {
        key[k] = item[k];
        delete item[k];
      }

      const params = {
        TableName: tableName,
        Key: key,
        ...convertToDynamoExpression(item),
      };
      await dynamoClient.send(new UpdateCommand(params));
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(` -- ERROR UPLOADING ${tableName}\n`, e);
  }
};

const convertToDynamoExpression = (listOfVars) => {
  let expressionAttributeNames = {};
  let expressionAttributeValues = {};
  let updateExpression = "";
  Object.keys(listOfVars).forEach((key, index) => {
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = listOfVars[key];

    updateExpression =
      index === 0
        ? `set #${key}=:${key}`
        : `${updateExpression}, #${key}=:${key}`;
  });
  return {
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  };
};

const buildSeedRunner = () => {
  const dynamoConfig = {
    logger: {
      warn: console.warn, // eslint-disable-line no-console
      error: console.error, // eslint-disable-line no-console
    },
  };
  const endpoint = process.env.DYNAMODB_URL;
  if (endpoint) {
    dynamoConfig.endpoint = endpoint;
    dynamoConfig.region = "localhost";
    dynamoConfig.credentials = {
      accessKeyId: "LOCALFAKEKEY", // pragma: allowlist secret
      secretAccessKey: "LOCALFAKESECRET", // pragma: allowlist secret
    };
    dynamoPrefix = "local";
  } else {
    dynamoConfig["region"] = "us-east-1";
    dynamoPrefix = process.env.dynamoPrefix;
  }

  const bareBonesClient = new DynamoDBClient(dynamoConfig);
  dynamoClient = DynamoDBDocumentClient.from(bareBonesClient);
  return {
    executeSeed: runSeed,
  };
};

module.exports = buildSeedRunner;
