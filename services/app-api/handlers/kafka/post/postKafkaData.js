exports.handler = async (event) => {
  const { Kafka } = require("kafkajs");
  // const kafka = new Kafka({ brokers: ["localhost:9092"] });

  // Process.env.StateFormsTableStreamArn
  // brokers take an array so I need to split env string so that it becomes an array
  const kafka = new Kafka({
    clientId: "dynamodb",
    brokers: [
      "b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
      "b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
      "b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094",
    ],
    ssl: {
      rejectUnauthorized: false,
    },
  });
  // If you specify the same group id and run this process multiple times, KafkaJS
  // won't get the events. That's because Kafka assumes that, if you specify a
  // group id, a consumer in that group id should only read each message at most once.

  // const consumer = kafka.consumer({ groupId: "" + Date.now() });
  // const producer = kafka.producer({ groupId: "" + Date.now() });
  const producer = kafka.producer(); // removed groupId because "working code in
  await producer.connect();
  const streamARN = event.eventSourceARN.toString();
  let topicName = "aws.mdct.seds.cdc.";

  if (streamARN.contains("age-ranges")) {
    topicName = topicName + "age-ranges";
  } else if (streamARN.contains("auth-user")) {
    topicName = topicName + "auth-user";
  } else if (streamARN.contains("auth-user-job-codes")) {
    topicName = topicName + "auth-user-job-codes";
  } else if (streamARN.contains("form-answers")) {
    topicName = topicName + "form-answers";
  } else if (streamARN.contains("form")) {
    topicName = topicName + "form";
  } else if (streamARN.contains("state-form")) {
    topicName = topicName + "state-form";
  } else if (streamARN.contains("states")) {
    topicName = topicName + "states";
  } else if (streamARN.contains("status")) {
    topicName = topicName + "status";
  }

  console.log("EVENT INFO HERE", event);
  console.log("topic Name HERE", topicName);
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
