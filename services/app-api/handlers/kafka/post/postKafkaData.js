exports.handler = async (event) => {
  const { Kafka } = require("kafkajs");

  const brokers = process.env.BOOTSTRAP_BROKER_STRING_TLS.split(",");
  console.log("brokers",brokers)
  const kafka = new Kafka({
    clientId: "dynamodb",
    brokers: [
      brokers[0],
      brokers[1],
      brokers[2],
    ],
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
  } else if (streamARN.includes("form")) {
    topicName = topicName + "form";
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
      console.log("FULL new  image RECORD", record.dynamodb.newImage);
      console.log("full record info", record);
      console.log("EVENT NAME", record.eventName);
      console.log("DynamoDB Record: %j", record.dynamodb);
    }
  }
  // try{
  //   const consumer = kafka.consumer({ groupId: "test2" });
  //   await consumer.connect();
  //   console.log("POST CONNECT");
  //   await consumer.subscribe({
  //     topic: "aws.mdct.seds.cdc.state-forms",
  //     fromBeginning: false,
  //   });
  //   console.log("POST SUBSCRIBE");
  //   await consumer.run({
  //     eachMessage: async ({ topic, partition, message }) => {
  //       console.log("partition HERE", partition);
  //       const messageAsJson = JSON.parse(message.value.toString());
  //       console.log("MESSAGE AS JSON HERE", messageAsJson);
  //       console.log("topic HERE", topic);
  //     },
  //   });
  //   console.log("POST MESSAGES LIST");
  // }
  //   catch (e){
  //     console.log("ERROR HERE", e);
  //   }
  return `Successfully processed ${event.Records.length} records.`;
};
