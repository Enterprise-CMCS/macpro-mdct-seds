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

exports.handler = async (event) => {
  const producer = kafka.producer();
  await producer.connect();

  const streamARN = String(event.Records[0].eventSourceARN.toString());
  let topicName = "aws.mdct.seds.cdc.";
  let version = ".v0";

  if (streamARN.includes("age-ranges")) {
    topicName = topicName + "age-ranges" + version;
  } else if (streamARN.includes("auth-user")) {
    topicName = topicName + "auth-user" + version;
  } else if (streamARN.includes("form-answers")) {
    topicName = topicName + "form-answers" + version;
  } else if (streamARN.includes("form-questions")) {
    topicName = topicName + "form-questions" + version;
  } else if (streamARN.includes("form-templates")) {
    topicName = topicName + "form-templates" + version;
  } else if (streamARN.includes("forms")) {
    topicName = topicName + "forms.v0";
  } else if (streamARN.includes("state-forms")) {
    topicName = topicName + "state-forms" + version;
  } else if (streamARN.includes("states")) {
    topicName = topicName + "states" + version;
  } else if (streamARN.includes("status")) {
    topicName = topicName + "status" + version;
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
