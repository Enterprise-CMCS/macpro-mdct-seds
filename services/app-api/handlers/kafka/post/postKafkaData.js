import { Kafka } from "kafkajs";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const STAGE = process.env.stage;
const BROKERS = process.env.BOOTSTRAP_BROKER_STRING_TLS;
const TABLES = [
  "age-ranges",
  "auth-user",
  "form-answers",
  "form-questions",
  "form-templates",
  "forms",
  "state-forms",
  "states",
  "status",
];

/**
 * Handle the Dynamo DB Stream Event, forwarding data to Kafka as needed.
 * @param {{
 *   Records: {
 *      eventID: string,
 *      eventName: string,
 *      eventSourceARN: string,
 *      dynamodb: {
 *        Keys: object,
 *        NewImage: object,
 *        OldImage: object | undefined
 *      }
 *    }[]
 * }} event - The event as received from AWS. For a sample event, see
 *   https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#events-sample-dynamodb
 * @returns { Promise<void> }
 */
export const handler = async (event) => {
  if (BROKERS === "localstack") {
    // If we are running locally, we do not want to communicate with Kafka.
    return;
  }
  if (!event.Records) {
    // If the event contains no payload, we don't need to connect to Kafka.
    return;
  }

  const topicMessages = createTopicMessages(event.Records);
  if (topicMessages.length === 0) {
    // If none of the messages were relevant, do not connect to Kafka.
    return;
  }

  const producer = await getConnectedProducer();
  await producer.sendBatch({ topicMessages });
};

/**
 * Filter the event's records to only the relevant ones,
 * transform them to Kafka messages,
 * and group them by topic.
 * @param {{
 *   eventID: string,
 *   eventName: string,
 *   eventSourceARN: string,
 *   dynamodb: {
 *     Keys: object,
 *     NewImage: object,
 *     OldImage: object | undefined
 *   }
 * }[]} records - The changes described by the the incoming event
 * @returns {{
 *   topic: string,
 *   messages: {
 *     headers: { eventID: string, eventName: string },
 *     partition: number,
 *     key: string;
 *     value: string;
 *   }[]
 * }[]}
 */
const createTopicMessages = (records) => {
  /** Map from topic string to messages array */
  const messageGroups = new Map();
  for (const record of records) {
    const topic = findRelevantTopic(record.eventSourceARN);
    if (!topic) {
      continue;
    }

    const message = createMessagePayload(record);

    const group = messageGroups.get(topic);
    if (!group) {
      messageGroups.set(topic, [message]);
    }
    else {
      group.push(message);
    }
  }

  return [...messageGroups].map(([topic, messages]) => ({ topic, messages }));
};

/**
 * Determine the identifier of the Kafka topic we should publish to, if any.
 * @param {string} streamARN - The identifier for this subscription
 * @returns {string | undefined}
 */
const findRelevantTopic = (streamARN) => {
  for (const table of TABLES) {
    if (streamARN.includes(`/${STAGE}-${table}/`)) {
      return `aws.mdct.seds.cdc.${table}.v0`;
    }
  }
};

/**
 * 
 * @param {{
 *   eventID: string,
 *   eventName: string,
 *   eventSourceARN: string,
 *   dynamodb: {
 *     Keys: object,
 *     NewImage: object,
 *     OldImage: object | undefined
 *   }
 * }} record - the change as described by AWS
 * @returns {{
 *   headers: { eventID: string, eventName: string },
 *   partition: number,
 *   key: string;
 *   value: string;
 * }} - the change in a format Kafka will understand
 */
const createMessagePayload = (record) => {
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
}

let PRODUCER;
/**
 * Returns a producer which is ready to send messages to Kafka.
 *
 * If we have already instantiated a producer on this thread, we use that one.
 * Otherwise, we create one. It will be connected to Kafka immediately,
 * and it will listen to process signals to disconnect when the thread dies.
 * 
 * @returns {Promise<{ sendBatch: () => Promise<void> }>}
 */
const getConnectedProducer = async () => {
  if (PRODUCER) {
    return PRODUCER;
  }
  const kafka = new Kafka({
    clientId: `seds-${STAGE}`,
    brokers: BROKERS.split(","),
    retry: { initialRetryTime: 300, retries: 8 },
    ssl: { rejectUnauthorized: false },
  });
  const producer = kafka.producer();
  const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"];

  signalTraps.map((type) => {
    process.removeListener(type, producer.disconnect);
  });

  signalTraps.map((type) => {
    process.once(type, producer.disconnect);
  });

  await producer.connect();
  PRODUCER = producer;
  return producer;
};
