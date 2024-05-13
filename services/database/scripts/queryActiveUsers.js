const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
} = require("@aws-sdk/lib-dynamodb");

/*
 * ENVIRONMENT VARIABLES TO SET:
 * AUTH_USER_TABLE_NAME: the name of the table in Dynamo
 * DYNAMODB_URL: the local URL if local; undefined otherwise
 * [anything needed for AWS auth, if not local]
 */
const {
  AUTH_USER_TABLE_NAME,
  DYNAMODB_URL,
} = process.env;

const logger = {
  debug: () => {},
  info: console.info,
  warn: console.warn,
  error: console.error,
};

const localConfig = {
  endpoint: DYNAMODB_URL,
  region: "localhost",
  credentials: {
    accessKeyId: "LOCALFAKEKEY", // pragma: allowlist secret
    secretAccessKey: "LOCALFAKESECRET", // pragma: allowlist secret
  },
  logger,
};

const awsConfig = {
  region: "us-east-1",
  logger,
};

const getConfig = () => {
  return DYNAMODB_URL ? localConfig : awsConfig;
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(getConfig()));

(async function () {
  const counts = new Map();
  for await (let page of paginateScan({ client }, { TableName: AUTH_USER_TABLE_NAME })) {
    if (!page.Items) continue;
    for (let user of page.Items) {
      const value = user.isActive;
      counts.set(value, 1 + (counts.get(value) ?? 0));
    }
  }
  for (let [value, count] of counts.entries()) {
    console.log(JSON.stringify(value), count);
  }
})();
