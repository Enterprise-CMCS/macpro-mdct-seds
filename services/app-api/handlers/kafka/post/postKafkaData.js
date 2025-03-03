import {
  convertAndBatchRecords,
  findRelevantTopic,
  sendMessagesToKafka,
} from "../../../libs/kafkaUtils";
import * as logger from "../../../libs/debug-lib.js"

const STAGE = process.env.stage;
const BROKERS = process.env.BOOTSTRAP_BROKER_STRING_TLS;
const topicPrefix = "aws.mdct.seds.cdc";
const version = "v0";
const TOPIC_NAMES = new Map([
  [process.env.AuthUserTable, `${topicPrefix}.auth-user.${version}`],
  [process.env.FormAnswersTable, `${topicPrefix}.form-answers.${version}`],
  [process.env.FormQuestionsTable, `${topicPrefix}.form-questions.${version}`],
  [process.env.FormsTable, `${topicPrefix}.forms.${version}`],
  [process.env.FormTemplatesTable, `${topicPrefix}.form-templates.${version}`],
  [process.env.StateFormsTable, `${topicPrefix}.state-forms.${version}`],
  [process.env.StatesTable, `${topicPrefix}.states.${version}`],
]);

/**
 * Handle the Dynamo DB Stream Event, forwarding data to Kafka as needed.
 * For a sample event, see https://docs.aws.amazon.com/lambda/latest/dg/with-ddb.html#events-sample-dynamodb
 */
export const handler = async (event) => {
  logger.debug("Received event: ", JSON.stringify(event));
  if (BROKERS === "localstack") {
    logger.info("Ignoring event - we are running locally");
    return;
  }
  if (!event.Records) {
    logger.info("Ignoring event - it contains no records");
    return;
  }

  const recordsWithTopics = event.Records.map((record) => ({
    topic: findRelevantTopic(TOPIC_NAMES, record),
    record,
  }));
  const relevantRecords = recordsWithTopics.filter(({ topic }) => !!topic);

  if (relevantRecords.length === 0) {
    logger.info("Ignoring event - none of the records pertain to tables we care about");
    return;
  }

  const outgoingMessages = convertAndBatchRecords(relevantRecords);

  logger.debug("Sending messages to Kafka: ", outgoingMessages);
  await sendMessagesToKafka(STAGE, BROKERS, outgoingMessages);
};
