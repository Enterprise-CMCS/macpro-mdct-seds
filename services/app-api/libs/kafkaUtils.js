import { Kafka } from "kafkajs";
import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * Determine the identifier of the Kafka topic we should publish to, if any.
 * @param {Map<string, string>} topicNameMap
 * @param {DynamoDBStreamEvent.Record} record
 * @returns {string | undefined}
 * @example
 * const topic = findRelevantTopic({
 *   eventSourceARN: "arn:aws:dynamodb:us-east-2:123456789012:table/production-state-forms/stream/2024-06-10T19:26:16.525",
 * });
 * console.log(topic); // "aws.mdct.seds.cdc.state-forms.v0"
 */
export const findRelevantTopic = (topicNameMap, record) => {
  for (const [tableName, topicName] of topicNameMap) {
    if (record.eventSourceARN.includes(`/${tableName}/`)) {
      return topicName;
    }
  }
  return undefined;
};

/**
 * Translate the stream event records to Kafka messags,
 * and batch them by topic.
 * @param {{ topic: string, record: DynamoDBStreamEvent.Record }[]} topicMessages
 */
export const convertAndBatchRecords = (recordsWithTopics) => {
  const messagesWithTopics = recordsWithTopics.map(({ topic, record }) => ({
    topic,
    message: createKafkaMessageFromRecord(record),
  }));
  const topicMessages = batchMessagesByTopic(messagesWithTopics);
  return { topicMessages };
}

/**
 * Translate the stream event records to Kafka messages,
 * batch them by topic, and send them to Kafka.
 *
 * The kafka producer connection will be managed automatically.
 *
 * @param {string} stage Should come from `process.env.stage`.
 *        Example: `"production"`
 * @param {string} brokerString Should come from `process.env.BOOTSTRAP_BROKER_STRING_TLS`.
 *        Example: `"broker1,broker2"`.
 * @param {*} outgoingMessages Should be the output from convertAndBatchRecords
 */
export const sendMessagesToKafka = async (
  stage,
  brokerString,
  outgoingMessages
) => {
  const producer = await getOrCreateProducer(stage, brokerString);
  await producer.sendBatch(outgoingMessages);
};


/**
 * Given a change from AWS, describe it in a way that will make sense to Kafka
 * @param {DynamoDBStreamEvent.Record} record The change as described by AWS
 */
const createKafkaMessageFromRecord = (record) => {
  const { eventID, eventName, dynamodb } = record;
  const { NewImage, OldImage, Keys } = dynamodb;
  const dynamoRecord = {
    NewImage: unmarshall(NewImage),
    OldImage: unmarshall(OldImage ?? {}),
    Keys: unmarshall(Keys),
  };
  return {
    key: Object.values(dynamoRecord.Keys).join("#"),
    value: JSON.stringify(dynamoRecord),
    partition: 0,
    headers: { eventID, eventName },
  };
};

/**
 * Given a list of messages, collect them into groups that share the same topic.
 * @param {{ topic: string, message: object }[]} flatMessageList
 * @returns {{ topic: string, messages: object[] }[]}
 * @example
 * // input
 * [
 *   { topic: "foo", message: m1 },
 *   { topic: "bar", message: m2 },
 *   { topic: "foo", message: m3 },
 * ]
 * // output
 * [
 *   { topic: "foo", messages: [m1, m3] },
 *   { topic: "bar", messages: [m2] },
 * ]
 */
const batchMessagesByTopic = (flatMessageList) => {
  const groups = flatMessageList.reduce(
    (map, { topic, message }) => {
      const messages = map.get(topic);
      if (messages) {
        messages.push(message);
      }
      else {
        map.set(topic, [message]);
      }
      return map;
    },
    new Map()
  );
  return Array.from(groups).map(([topic, messages]) => ({ topic, messages }))
};

/**
 * Prepare a Kafka Producer to send messages.
 *
 * If this thread already has a connected producer, we will use it.
 * Otherwise, we will create a new one, and connect it.
 */
const getOrCreateProducer = async (stage, brokerString) => {
  const config = `${stage}|${brokerString}`;
  if (PRODUCER && (config === PREV_CONFIG)) {
    // We already have a producer, with the requested config. Use it.
    return PRODUCER;
  }
  else if (PRODUCER) {
    // We have a new config; we need a new producer. Disconnect the old one.
    PRODUCER.disconnect();
  }
  
  const producer = await createProducer(stage, brokerString);
  producer.on("producer.disconnect", () => {
    // If the producer's connection is closed, discard our reference.
    PRODUCER = undefined;
  });

  // Remember this producer & config for future use in this thread
  PRODUCER = producer;
  PREV_CONFIG = config;

  return producer;
};
let PRODUCER;
let PREV_CONFIG;

/**
 * Construct a Kafka Producer, ready to send messages.
 */
const createProducer = async (stage, brokerString) => {
  const kafka = new Kafka({
    clientId: `seds-${stage}`,
    brokers: brokerString.split(","),
    retry: { initialRetryTime: 300, retries: 8 },
    ssl: { rejectUnauthorized: false },
  });

  const producer = kafka.producer();
  setupDisconnectListeners(producer);
  await producer.connect();

  return producer;
};

/**
 * Ensure this producer will dispose of its connection when the process ends.
 */
const setupDisconnectListeners = (producer) => {
  const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];

  signalTraps.map((type) => {
    process.removeListener(type, producer.disconnect);
  });

  signalTraps.map((type) => {
    process.once(type, producer.disconnect);
  });
};
