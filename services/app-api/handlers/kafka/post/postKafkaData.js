import AWS from "aws-sdk";

const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: `seds-${process.env.STAGE}`,
  brokers: process.env.BOOTSTRAP_BROKER_STRING_TLS.split(","),
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

let topicPrefix = "aws.mdct.seds.cdc";
let version = "v0";
const topic = (t) => `${topicPrefix}.${t}.${version}`;
const stringify = (e) => JSON.stringify(e, null, 2);

const unmarshallOptions = {
  convertEmptyValues: true,
  wrapNumbers: true,
};
const unmarshall = (r) =>
  AWS.DynamoDB.Converter.unmarshall(r, unmarshallOptions);

const producer = kafka.producer();
let connected = false;
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];

signalTraps.map((type) => {
  process.removeListener(type, producer.disconnect);
});

signalTraps.map((type) => {
  process.once(type, producer.disconnect);
});

const determineTopicName = (streamARN) => {
  if (streamARN.includes("age-ranges")) {
    return topic("age-ranges");
  } else if (streamARN.includes("auth-user")) {
    return topic("auth-user");
  } else if (streamARN.includes("form-answers")) {
    return topic("form-answers");
  } else if (streamARN.includes("form-questions")) {
    return topic("form-questions");
  } else if (streamARN.includes("form-templates")) {
    return topic("form-templates");
  } else if (streamARN.includes("forms")) {
    return topic("forms");
  } else if (streamARN.includes("state-forms")) {
    return topic("state-forms");
  } else if (streamARN.includes("states")) {
    return topic("states");
  } else if (streamARN.includes("status")) {
    return topic("status");
  }
};

const createDynamoPayload = (record) => {
  const dynamodb = record.dynamodb;
  const dynamoRecord = {
    NewImage: unmarshall(dynamodb.NewImage),
    OldImage: unmarshall(dynamodb.OldImage),
    Keys: unmarshall(dynamodb.Keys),
  };
  return stringify(dynamoRecord);
};

exports.handler = async (event) => {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  console.log("Raw event", stringify(event));
  if (event.Records) {
    let outboundEvents = {};
    for (const record of event.Records) {
      const topicName = determineTopicName(
        String(record.eventSourceARN.toString())
      );

      const dynamoStringified = createDynamoPayload(record);

      //initialize configuration object keyed to topic for quick lookup
      if (!(outboundEvents[topicName] instanceof Object))
        outboundEvents[topicName] = {
          key: Object.values(dynamoRecord.Keys).join("#"),
          topic: topicName,
          partition: 0,
          messages: [],
        };

      //add messages to messages array for corresponding topic
      outboundEvents[topicName].messages.push(dynamoStringified);
    }

    const batchConfiguration = Object.values(outboundEvents);
    console.log(`Batch configuration: ${batchConfiguration}`);

    //await producer.sendBatch({ batchConfiguration });
  }

  return `Successfully processed ${event.Records.length} records.`;
};
