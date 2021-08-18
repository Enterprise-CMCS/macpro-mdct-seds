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

let topicName = "aws.mdct.seds.cdc";
let version = "v0";
const topic = (t) => `${topicName}.${t}.${version}`;
const stringify = (e) => JSON.stringify(e, null, 2);

const producer = kafka.producer();
await producer.connect();

const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];

signalTraps.map((type) => {
  process.removeListener(type, producer.disconnect);
});

signalTraps.map((type) => {
  process.once(type, producer.disconnect);
});

exports.handler = async (event) => {
  console.log("EVENT INFO HERE", stringify(event));
  try {
    if (event.Records) {
      for (const record of event.Records) {
        const streamARN = String(record.eventSourceARN.toString());
        let pk;

        if (streamARN.includes("age-ranges")) {
          topicName = topic("age-ranges");
          pk = "ageRange";
        } else if (streamARN.includes("auth-user")) {
          topicName = topic("auth-user");
          pk = "userId";
        } else if (streamARN.includes("form-answers")) {
          topicName = topic("form-answers");
          pk = "answer_entry";
        } else if (streamARN.includes("form-questions")) {
          topicName = topic("form-questions");
          pk = "question";
        } else if (streamARN.includes("form-templates")) {
          topicName = topic("form-templates");
          pk = "year";
        } else if (streamARN.includes("forms")) {
          topicName = topic("forms");
        } else if (streamARN.includes("state-forms")) {
          topicName = topic("state-forms");
          pk = "state_form";
        } else if (streamARN.includes("states")) {
          topicName = topic("states");
          pk = "state_id";
        } else if (streamARN.includes("status")) {
          topicName = topic("status");
          pk = "status";
        }

        const dynamoRecord = AWS.DynamoDB.Converter.unmarshall(record.dynamodb);
        const dynamoStringified = stringify(dynamoRecord);

        await producer.send({
          topic: topicName,
          messages: [
            {
              key: dynamoRecord.dynamodb.NewImage[pk],
              value: dynamoStringified,
              partition: 0,
            },
          ],
        });
        console.log("DynamoDB Record: %j", dynamoStringified);
      }
    }
  } catch (e) {
    console.log("error:", e);
  }

  return `Successfully processed ${event.Records.length} records.`;
};
