import AWS from "aws-sdk";
const { Kafka } = require("kafkajs");

const STAGE = process.env.STAGE;
const kafka = new Kafka({
  clientId: `seds-${STAGE}`,
  brokers: process.env.BOOTSTRAP_BROKER_STRING_TLS.split(","),
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

exports.config = {
  topicPrefix: "aws.mdct.seds.cdc",
  version: "v0",
  tables: [
    "age-ranges",
    "auth-user",
    "form-answers",
    "form-questions",
    "form-templates",
    "forms",
    "state-forms",
    "states",
    "status",
  ],
  determineTopicName: (streamARN) => {
    for (const table of exports.config.tables) {
      if (streamARN.includes(`/${STAGE}-${table}/`)) return exports.config.topic(table);
    }
  },
  unmarshallOptions: {
    convertEmptyValues: true,
    wrapNumbers: true,
  },
  unmarshall: (r) =>
    AWS.DynamoDB.Converter.unmarshall(r, exports.config.unmarshallOptions),
  createDynamoPayload: (record) => {
    const dynamodb = record.dynamodb;
    const { eventID, eventName } = record;
    const dynamoRecord = {
      NewImage: exports.config.unmarshall(dynamodb.NewImage),
      OldImage: exports.config.unmarshall(dynamodb.OldImage),
      Keys: exports.config.unmarshall(dynamodb.Keys),
    };
    return {
      key: Object.values(dynamoRecord.Keys).join("#"),
      value: stringify(dynamoRecord),
      partition: 0,
      headers: { eventID: eventID, eventName: eventName },
    };
  },
  topic: (t) => `${exports.config.topicPrefix}.${t}.${exports.config.version}`,
};

const stringify = (e, prettyPrint) => {
  if (prettyPrint === true) return JSON.stringify(e, null, 2);
  return JSON.stringify(e);
};

const producer = kafka.producer();
let connected = false;
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];

signalTraps.map((type) => {
  process.removeListener(type, producer.disconnect);
});

signalTraps.map((type) => {
  process.once(type, producer.disconnect);
});

exports.handler = async (event) => {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  console.log("Raw event", stringify(event, true));
  if (event.Records) {
    let outboundEvents = {};
    for (const record of event.Records) {
      const topicName = exports.config.determineTopicName(
        String(record.eventSourceARN.toString())
      );

      const dynamoPayload = exports.config.createDynamoPayload(record);

      //initialize configuration object keyed to topic for quick lookup
      if (!(outboundEvents[topicName] instanceof Object))
        outboundEvents[topicName] = {
          topic: topicName,
          messages: [],
        };

      //add messages to messages array for corresponding topic
      outboundEvents[topicName].messages.push(dynamoPayload);
    }

    const topicMessages = Object.values(outboundEvents);
    console.log(`Batch configuration: ${stringify(topicMessages, true)}`);

    await producer.sendBatch({ topicMessages });
  }

  console.log(`Successfully processed ${event.Records.length} records.`);
};
