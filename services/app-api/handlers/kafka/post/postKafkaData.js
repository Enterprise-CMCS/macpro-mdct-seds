import AWS from "aws-sdk";

const { Kafka } = require("kafkajs");
const kafka = new Kafka({
  clientId: "dynamodb",
  brokers: process.env.BOOTSTRAP_BROKER_STRING_TLS.split(","),
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

let topicName = "aws.mdct.seds.cdc";
let version = "v0";
const topic = (t) => `${topicName}.${t}.${version}`;

exports.handler = async (event) => {
  const producer = kafka.producer();
  await producer.connect();

  const streamARN = String(event.Records[0].eventSourceARN.toString());

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

  console.log("EVENT INFO HERE", event);
  try {
    if (event.Records) {
      for (const record of event.Records) {
        await producer.send({
          topic: topicName,
          messages: [
            {
              key: "key4",
              value: AWS.DynamoDB.Converter.unmarshall(record.dynamodb),
              partition: 0,
            },
          ],
        });
        console.log("DynamoDB Record: %j", record.dynamodb);
      }
    }
  } catch (e) {
    console.log("error:", e);
  }

  return `Successfully processed ${event.Records.length} records.`;
};
