import { unmarshall as dynamoDbUnmarshall } from "@aws-sdk/util-dynamodb";
import { Kafka } from "kafkajs";

const STAGE = process.env.stage;
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.brokerString.split(","),
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
  ssl: {
    rejectUnauthorized: false,
  },
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

  stringify(e, prettyPrint) {
    if (prettyPrint === true) return JSON.stringify(e, null, 2);
    return JSON.stringify(e);
  }

  determineTopicName(streamARN) {
    for (const table of this.tables) {
      if (streamARN.includes(`/${STAGE}-${table}/`)) return this.topic(table);
    }
  }

  unmarshall(r) {
    return dynamoDbUnmarshall(r);
  }

  createPayload(record) {
    return this.createDynamoPayload(record);
  }

  createDynamoPayload(record) {
    const dynamodb = record.dynamodb;
    const { eventID, eventName } = record;
    const dynamoRecord = {
      NewImage: this.unmarshall(dynamodb.NewImage),
      OldImage: this.unmarshall(dynamodb.OldImage ?? {}),
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
      return `${this.topicPrefix}.${t}.${this.version}`;
    } else {
      return `${this.topicPrefix}.${t}`;
    }
  }

  createOutboundEvents(records) {
    let outboundEvents = {};
    for (const record of records) {
      const topicName = this.determineTopicName(
        String(record.eventSourceARN.toString())
      );

      if (!topicName) {
        continue;
      }

      /*
       * ⚠️ WARNING ⚠️
       * The MDCT SEDS database contains thousands of state forms from 2019
       * which appear to be In Progress, whereas DataConnect's records
       * of these forms indicate they have been Final Certified.
       * This appears to be the result of some sort of data import gone wrong?
       * Note that the SEDS system as you see it went live in 2020.
       * In any case, those forms are assumed incorrect and should NOT BE SENT
       * through Kafka to DataConnect - unless an actual user action has bumped
       * the last_modified date.
       */
      if ( topicName.includes(".state-forms.") ||
        topicName.includes(".form-answers.")
      ) {
        // This object might be a StateForm or a FormAnswer.
        // Both have both state_form and last_modified properties
        const obj = this.unmarshall(record.dynamodb.NewImage);
        // The state_form property is a string like "CO-2025-4-21E"
        const year = Number(obj.state_form.split("-")[1]);
        // last_modified is an ISO date string like "2025-10-21T19:49:50.105Z"
        const lastModified = new Date(obj.last_modified).getFullYear();
        if (year === 2019 && lastModified < 2025
        ) {
          continue;
        }
      }

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
    if (process.env.brokerString === "localstack") {
      return;
    }

    if (!connected) {
      await producer.connect();
      connected = true;
    }
    console.log("Raw event", this.stringify(event, true));

    if (event.Records) {
      const outboundEvents = this.createOutboundEvents(event.Records);

      const topicMessages = Object.values(outboundEvents);
      
      if (topicMessages.length > 0) {
        console.log(
          `Batch configuration: ${this.stringify(topicMessages, true)}`
        );
        await producer.sendBatch({ topicMessages });
      } else {
        console.log("Ignored all records - no messages to send.");
      }
    }

    console.log(`Successfully processed ${event.Records.length} records.`);
  }
}

export default KafkaSourceLib;
