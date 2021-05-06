exports.handler = async  (event) => {
  const { Kafka } = require("kafkajs");
  // const kafka = new Kafka({ brokers: ["localhost:9092"] });


  const kafka = new Kafka({ clientId: 'dynamodb', brokers: ["b-1.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094","b-2.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094","b-3.master-msk.zf7e0q.c7.kafka.us-east-1.amazonaws.com:9094"],
    ssl: {
      rejectUnauthorized: false
    }});
  // If you specify the same group id and run this process multiple times, KafkaJS
  // won't get the events. That's because Kafka assumes that, if you specify a
  // group id, a consumer in that group id should only read each message at most once.

  // const consumer = kafka.consumer({ groupId: "" + Date.now() });
  // const producer = kafka.producer({ groupId: "" + Date.now() });
  const producer = kafka.producer(); // removed groupId because "working code in
  await producer.connect();

  if(event.Records) {
    for (const record of event.Records) {

      await producer.send({
        topic: 'state-forms',
        messages: [
          {
            key: 'key2', value: JSON.stringify(record.dynamodb, null, 2),
            headers: {
              'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67',
              'system-id': 'dev-test'
            }
          }
        ],
      })
      console.log(record.eventID);
      console.log(record.eventName);
      console.log('DynamoDB Record: %j', record.dynamodb);
    }
  }


  // const consumer = kafka.consumer();
  // await consumer.connect();
  //
  // await consumer.subscribe({ topic: "state-forms", fromBeginning: true });
  // await consumer.run({
  //   eachMessage: async (data) => {
  //     console.log(data);
  //   }
  // });
  return `Successfully processed ${event.Records.length} records.`;
}
