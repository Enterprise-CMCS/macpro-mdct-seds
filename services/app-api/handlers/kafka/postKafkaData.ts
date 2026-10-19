import KafkaSourceLib from "../../libs/kafka-source-lib.ts";

class PostKafkaData extends KafkaSourceLib {
  topicPrefix = "aws.mdct.seds.cdc";
  version = "v0";
  tables = [
    "auth-user",
    "form-answers",
    "form-questions",
    "form-templates",
    "state-forms",
  ];
}

const postKafkaData = new PostKafkaData();

export const handler = postKafkaData.handler.bind(postKafkaData);
