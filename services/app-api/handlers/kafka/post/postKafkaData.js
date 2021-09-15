import kafkaLib from "../../../libs/kafka-source-lib";

const config = {
  topicPrefix: "aws.mdct.seds.cdc",
  version: "v0",
  tables: [
    "age-ranges",
    "auth-user",
    "form-answers",
    "form-questions",
    "form-templates",
    "forms",
    "state-forms",
    "states",
    "status",
  ],
};

kafakLib.config = { ...kafkaLib.config, ...config };

exports.handler = kafkaLib.handler;
