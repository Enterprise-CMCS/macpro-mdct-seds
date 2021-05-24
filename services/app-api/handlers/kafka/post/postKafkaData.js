exports.handler = async (event) => {
  const { Kafka } = require("kafkajs");
  const kafka = new Kafka({
    clientId: "dynamodb",
    // brokers:[
    //   "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
    //   "b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
    //   "b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094"
    // ],
    brokers: process.env.BOOTSTRAP_BROKER_STRING_TLS.split(","),
    retry: {
      initialRetryTime: 300,
      retries: 8,
    },
    // process.env.BOOTSTRAP_BROKER_STRING_TLS.split(","), THIS DOES NOT WORK FOR state-forms topic/table
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const producer = kafka.producer();
  await producer.connect();

  const streamARN = String(event.Records[0].eventSourceARN.toString());
  let topicName = "aws.mdct.seds.cdc.";

  if (streamARN.includes("age-ranges")) {
    topicName = topicName + "age-ranges";
  } else if (streamARN.includes("auth-user")) {
    topicName = topicName + "auth-user";
  } else if (streamARN.includes("auth-user-job-codes")) {
    topicName = topicName + "auth-user-job-codes";
  } else if (streamARN.includes("auth-user-states")) {
    topicName = topicName + "auth-user-states";
  } else if (streamARN.includes("auth-user-roles")) {
    topicName = topicName + "auth-user-roles";
  } else if (streamARN.includes("form-answers")) {
    topicName = topicName + "form-answers";
  } else if (streamARN.includes("form-questions")) {
    topicName = topicName + "form-questions";
  } else if (streamARN.includes("forms")) {
    topicName = topicName + "forms";
  } else if (streamARN.includes("state-forms")) {
    topicName = topicName + "state-forms";
  } else if (streamARN.includes("states")) {
    topicName = topicName + "states";
  } else if (streamARN.includes("status")) {
    topicName = topicName + "status";
  }

  console.log("EVENT INFO HERE", event);

  if (event.Records) {
    for (const record of event.Records) {
      await producer.send({
        topic: topicName,
        messages: [
          {
            key: "key4",
            value: JSON.stringify(record.dynamodb, null, 2),
            partition: 0,
          },
        ],
      });

      console.log("DynamoDB Record: %j", record.dynamodb);
    }
  }

  return `Successfully processed ${event.Records.length} records.`;
};
