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
const buildKey = (keys) => {
  let arr = [];
  for(const typeKey of Object.values(keys)) {
    //will always be one and only one
    arr.push(Object.values(typeKey)[0]);
  }
  return arr;
}

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
  if(!connected) {
    await producer.connect();
    connected = true;
  }
  console.log("EVENT INFO HERE", stringify(event));
  try {
    if (event.Records) {
      for (const record of event.Records) {
        const streamARN = String(record.eventSourceARN.toString());

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

        const dynamoRecord = AWS.DynamoDB.Converter.unmarshall(record.dynamodb);
        console.log('UNMARSHALLED',stringify(dynamoRecord));
        const dynamoStringified = stringify(AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage));

        await producer.send({
          topic: topicName,
          messages: [
            {
              key: buildKeys(record.dynamodb.Keys),
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
