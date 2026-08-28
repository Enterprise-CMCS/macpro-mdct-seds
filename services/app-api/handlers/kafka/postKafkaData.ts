import { GetDynamoTopic, kafkaHandler } from "./kafkaLib.ts";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const getConfig = () => {
  const { brokerString, KAFKA_CLIENT_ID, STAGE } = process.env;

  if (!brokerString) {
    throw new Error("Missing config! Must specify brokerString");
  } else if (brokerString === "localstack") {
    console.debug("Ignoring event: Localstack should not talk to Kafka");
    return undefined;
  }

  if (!KAFKA_CLIENT_ID) {
    throw new Error("Missing config! Must specify KAFKA_CLIENT_ID");
  }

  if (!STAGE) {
    throw new Error("Missing config! Must specify STAGE");
  }

  return {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.brokerString!.split(","),
    retry: {
      initialRetryTime: 300,
      retries: 8,
    },
    ssl: {
      rejectUnauthorized: false,
    },
  };
};

const getDynamoTopic: GetDynamoTopic = (record) => {
  const tables = [
    "auth-user",
    "form-answers",
    "form-questions",
    "form-templates",
    "state-forms",
  ];

  const table = tables.find((t) =>
    record.eventSourceARN.includes(`/${process.env.STAGE}-${t}/`)
  );
  if (!table) {
    console.warn(`Ignoring record: no matching table`);
    return undefined;
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
  if (table === "state-forms" || table === "form-answers") {
    // This object might be a StateForm or a FormAnswer.
    // Both have both state_form and last_modified properties
    const obj = unmarshall(record.dynamodb.NewImage);
    // The state_form property is a string like "CO-2025-4-21E"
    const year = Number(obj.state_form.split("-")[1]);
    // last_modified is an ISO date string like "2025-10-21T19:49:50.105Z"
    const lastModified = new Date(obj.last_modified).getFullYear();
    if (year === 2019 && lastModified < 2025) {
      return undefined;
    }
  }

  return `aws.mdct.seds.cdc.${table}.v0`;
};

export const handler = kafkaHandler({
  getConfig,
  getDynamoTopic,
});
