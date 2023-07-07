import AWS from "aws-sdk";
import { Kafka } from "kafkajs";
import { createMechanism } from "@jm18457/kafkajs-msk-iam-authentication-mechanism";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

class KafkaSourceLib {
  /*
  Event types:
  cmd – command; restful publish
  cdc – change data capture; record upsert/delete in data store
  sys – system event; send email, archive logs
  fct – fact; user activity, notifications, logs

  topicPrefix = "[data_center].[system_of_record].[business_domain].[event_type]";
  version = "some version";
  tables = [list of tables];
  */
  unmarshallOptions = {
    convertEmptyValues: true,
    wrapNumbers: true,
  };
  stringify(e, prettyPrint) {
    if (prettyPrint === true) return JSON.stringify(e, null, 2);
    return JSON.stringify(e);
  }
  determineTopicName(streamARN) {
    const STAGE = process.env.STAGE;
    
    for (const table of this.tables) {
      if (streamARN.includes(`/${STAGE}-${table}/`)) return this.topic(table);
    }
  }
  unmarshall(r) {
    return AWS.DynamoDB.Converter.unmarshall(r, this.unmarshallOptions);
  }
  createPayload(record) {
    return this.createDynamoPayload(record);
  }
  createDynamoPayload(record) {
    const dynamodb = record.dynamodb;
    const { eventID, eventName } = record;
    const dynamoRecord = {
      NewImage: this.unmarshall(dynamodb.NewImage),
      OldImage: this.unmarshall(dynamodb.OldImage),
      Keys: this.unmarshall(dynamodb.Keys),
    };
    return {
      key: Object.values(dynamoRecord.Keys).join("#"),
      value: this.stringify(dynamoRecord),
      partition: 0,
      headers: { eventID: eventID, eventName: eventName },
    };
  }
  topic(t) {
    if (this.version) {
      return `${this.topicPrefix}${t}.${this.version}`;
    } else {
      return `${this.topicPrefix}${t}`;
    }
  }
  createOutboundEvents(records) {
    let outboundEvents = {};
    for (const record of records) {
      const topicName = this.determineTopicName(
        String(record.eventSourceARN.toString())
      );
      const dynamoPayload = this.createPayload(record);
      //initialize configuration object keyed to topic for quick lookup
      if (!(outboundEvents[topicName] instanceof Object))
        outboundEvents[topicName] = {
          topic: topicName,
          messages: [],
        };
      //add messages to messages array for corresponding topic
      outboundEvents[topicName].messages.push(dynamoPayload);
    }
    return outboundEvents;
  }
  async handler(event) {
    const STAGE = process.env.STAGE;
    const sasl = await getMechanism("us-east-1", process.env.bigmacRoleArn);
    const kafka = new Kafka({
      clientId: `carts-${STAGE}`,
      brokers: process.env.BOOTSTRAP_BROKER_STRING_TLS.split(","),
      retry: {
        initialRetryTime: 300,
        retries: 8,
      },
      ssl: true,
      sasl: sasl,
      requestTimeout: 295000,
    });

    const producer = kafka.producer();
    let connected = false;
    const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];

    signalTraps.map((type) => {
      process.removeListener(type, producer.disconnect);
    });
    signalTraps.map((type) => {
      process.once(type, producer.disconnect);
    });

    if (!connected) {
      console.log("Attempting connection...");
      await producer.connect();
      connected = true;
    }
    console.log("Raw event", this.stringify(event, true));
    if (event.Records) {
      const outboundEvents = this.createOutboundEvents(event.Records);
      const topicMessages = Object.values(outboundEvents);
      console.log(
        `Batch configuration: ${this.stringify(topicMessages, true)}`
      );
      await producer.sendBatch({ topicMessages });
    }

    console.log(`Successfully processed ${event.Records.length} records.`);
  }
}

async function getMechanism(region, role) {
  const sts = new STSClient({
    region,
  });
  const crossAccountRoleData = await sts.send(
    new AssumeRoleCommand({
      RoleArn: role,
      RoleSessionName: "LambdaSession",
      ExternalId: "asdf",
    })
  );
  return createMechanism({
    region,
    credentials: {
      authorizationIdentity: crossAccountRoleData.AssumedRoleUser.AssumeRoleId,
      accessKeyId: crossAccountRoleData.Credentials.AccessKeyId,
      secretAccessKey: crossAccountRoleData.Credentials.SecretAccessKey,
      sessionToken: crossAccountRoleData.Credentials.SessionToken,
    },
  });
}
export default KafkaSourceLib;
