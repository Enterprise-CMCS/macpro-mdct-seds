import { Kafka, KafkaConfig, Message, Producer, ProducerBatch } from "kafkajs";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export const kafkaHandler = (callbacks: KafkaCallbacks) => {
  return async (event: AwsStreamEvent) => {
    const config = callbacks.getConfig();
    if (config === undefined) {
      return;
    }
    console.debug(`Raw event: ${JSON.stringify(event, null, 2)}`);

    const messages: { topic: string; message: Message }[] = [];
    for (const record of event.Records ?? []) {
      const message = await convertToMessage(record, callbacks);
      if (message) {
        messages.push(message);
      }
    }

    const topics = [...new Set(messages.map((m) => m.topic))];
    const topicMessages = topics.map((topic) => ({
      topic,
      messages: messages.filter((m) => m.topic === topic).map((m) => m.message),
    }));

    if (topicMessages.length === 0) {
      console.warn(`Ignoring event: no messages to send.`);
      return;
    }

    const batch = { topicMessages };
    console.debug(`Outgoing message batch: ${JSON.stringify(batch, null, 2)}`);

    await LazyProducer.sendBatch(config, batch);
    console.info(`Processing complete.`);
  };
};

/**
 * Translate an AWS stream event record into a Kafka message.
 * @returns `undefined` if a topic cannot be found.
 */
const convertToMessage = async (
  record: NonNullable<AwsStreamEvent["Records"]>[number],
  { getDynamoTopic, getS3Topic, getS3Object }: KafkaCallbacks
) => {
  if ("dynamodb" in record) {
    const topic = getDynamoTopic!(record);
    if (!topic) {
      return undefined;
    }
    const { eventID, eventName, dynamodb } = record;
    const headers = { eventID, eventName };
    const Keys = unmarshall(dynamodb.Keys);
    const key = Object.values(Keys).join("#");
    const OldImage = unmarshall(dynamodb.OldImage ?? {});
    const NewImage = unmarshall(dynamodb.NewImage);
    const value = JSON.stringify({ NewImage, OldImage, Keys });
    return { topic, message: { headers, partition: 0, key, value } };
  } else if ("s3" in record) {
    const topic = getS3Topic!(record);
    if (!topic) {
      return undefined;
    }
    const { eventTime, eventName, s3 } = record;
    const headers = { eventName, eventTime };
    const bucket = s3.bucket.name;
    const key = s3.object.key;
    // May be s3:ObjectRemoved:Delete or s3:ObjectRemoved:DeleteMarkerCreated
    const includeData = !record.eventName.includes("ObjectRemoved");
    const value = includeData ? await getS3Object!(bucket, key) : "";
    return { topic, message: { headers, partition: 0, key, value } };
  }
};

/**
 * Shared producer instance for the entire process.
 * Connects / disconnects only as necessary.
 * Note: config cannot be changed after the first call to sendBatch.
 */
const LazyProducer = (() => {
  let producer: Producer | undefined;
  let connectPromise: Promise<void> | undefined;
  let connected = false;

  const connect = async (config: KafkaConfig) => {
    for (const signal of ["SIGTERM", "SIGINT", "SIGUSR2", "beforeExit"]) {
      process.removeListener(signal, disconnect);
      process.once(signal, disconnect);
    }

    const kafka = new Kafka(config);
    await producer?.disconnect();
    producer = kafka.producer();
    producer.on("producer.disconnect", disconnect);
    await producer.connect();
    connected = true;
  };

  const disconnect = async (...args: any) => {
    console.info(`Disconnecting...`, args);
    await producer?.disconnect();
    connected = false;
    console.info("Disconnected.");
  };

  return {
    sendBatch: async (config: KafkaConfig, batch: ProducerBatch) => {
      if (!connected) {
        // If sendBatch is called twice before we can finish connecting once,
        // both calls will wait for the same connection promise.
        connectPromise ??= connect(config);
        await connectPromise;
        connectPromise = undefined;
      }
      await producer!.sendBatch(batch);
    },
  };
})();

export type KafkaCallbacks = {
  getConfig: GetKafkaConfig;
  getDynamoTopic?: GetDynamoTopic;
  getS3Topic?: GetS3Topic;
  getS3Object?: GetS3Object;
};

/**
 * Collect environment variables and define settings.
 * @returns A config object, or undefined if we quietly skip Kafka in this env.
 * @throws If we _should_ talk to Kafka in this env, but cannot determine how.
 */
export type GetKafkaConfig = () => KafkaConfig | undefined;

/**
 * On which Kafka topic, if any, should this Dynamo change be broadcast?
 * @returns The full topic name, OR undefined if no message should be sent.
 */
export type GetDynamoTopic = (
  record: DynamoDbStreamRecord
) => string | undefined;

/**
 * On which Kafka topic, if any, should this S3 change be broadcast?
 * @returns The full topic name, OR undefined if no message should be sent.
 */
export type GetS3Topic = (record: S3StreamRecord) => string | undefined;

/**
 * Retrieve the given object. Leave it as a string; no need to JSON parse.
 */
export type GetS3Object = (bucket: string, key: string) => Promise<string>;

type AwsStreamEvent = DynamoDbStreamEvent | S3StreamEvent;

type DynamoDbStreamEvent = {
  Records?: DynamoDbStreamRecord[];
};
type DynamoDbStreamRecord = {
  eventSourceARN: string;
  eventID: string;
  eventName: string;
  dynamodb: {
    Keys: Record<string, any>;
    OldImage?: Record<string, any>;
    NewImage: Record<string, any>;
  };
};

type S3StreamEvent = {
  Records?: S3StreamRecord[];
};
type S3StreamRecord = {
  eventSourceARN: string;
  eventName: string;
  eventTime: string;
  s3: {
    bucket: {
      arn: string;
      name: string;
    };
    object: {
      key: string;
    };
  };
};
