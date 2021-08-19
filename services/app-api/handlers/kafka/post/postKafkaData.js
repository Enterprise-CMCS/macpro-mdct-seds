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

exports.handler = async (event) => {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
  console.log("Raw event", stringify(event));
  try {
    if (event.Records) {
      let outboundEvents = {};
      for (const record of event.Records) {
        const streamARN = String(record.eventSourceARN.toString());
        let topicName;
        if (streamARN.includes("age-ranges")) {
          topicName = topic("age-ranges");
        } else if (streamARN.includes("auth-user")) {
          topicName = topic("auth-user");
        } else if (streamARN.includes("form-answers")) {
          topicName = topic("form-answers");
        } else if (streamARN.includes("form-questions")) {
          topicName = topic("form-questions");
        } else if (streamARN.includes("form-templates")) {
          topicName = topic("form-templates");
        } else if (streamARN.includes("forms")) {
          topicName = topic("forms");
        } else if (streamARN.includes("state-forms")) {
          topicName = topic("state-forms");
        } else if (streamARN.includes("states")) {
          topicName = topic("states");
        } else if (streamARN.includes("status")) {
          topicName = topic("status");
        }

        const dynamodb = record.dynamodb;
        const dynamoRecord = {
          NewImage: unmarshall(dynamodb.NewImage),
          OldImage: unmarshall(dynamodb.OldImage),
          Keys: unmarshall(dynamodb.Keys),
        };
        const dynamoStringified = stringify(dynamoRecord);

        //initialize "messages" array, keyed to topicName
        if (!(outboundEvents[topicName] instanceof Object))
          outboundEvents[topicName] = {
            key: Object.values(dynamoRecord.Keys).join("#"),
            topic: topicName,
            partition: 0,
            messages: [],
          };

        //build map of messages
        outboundEvents[topicName].messages.push(dynamoStringified);
      }

      const batchConfiguration = Object.values(outboundEvents);
      console.log(`Batch configuration: ${batchConfiguration}`);

      //await producer.sendBatch({ batchConfiguration });
    }
  } catch (e) {
    console.log("error:", e);
  }

  return `Successfully processed ${event.Records.length} records.`;
};
