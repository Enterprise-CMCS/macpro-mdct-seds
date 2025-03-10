import KafkaSourceLib from "../../../libs/kafka-source-lib.js";

class PostKafkaData extends KafkaSourceLib {
  topicPrefix = "aws.mdct.seds.cdc";
  version = "v0";
  tables = [
    "auth-user",
    "form-answers",
    "form-questions",
    "form-templates",
    "forms",
    "state-forms",
    "states",
  ];
}

const postKafkaData = new PostKafkaData();

exports.handler = postKafkaData.handler.bind(postKafkaData);
