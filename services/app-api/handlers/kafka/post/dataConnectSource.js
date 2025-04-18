import KafkaSourceLib from "../../../libs/kafka-source-lib.js";

class DataConnectTransform extends KafkaSourceLib {
  topicPrefix = "aws.mdct.seds.cdc";
  tables = [
    "auth-user",
    "form-answers",
    "form-questions",
    "form-templates",
    "forms",
    "state-forms",
    "states",
  ];

  createPayload(record) {
    const dynamodb = record.dynamodb;
    const { eventID, eventName } = record;
    return {
      key: Object.values(this.unmarshall(dynamodb.Keys)).join("#"),
      value: this.stringify(dynamodb, true),
      partition: 0,
      headers: { eventID: eventID, eventName: eventName },
    };
  }
}

const dataConnectTransform = new DataConnectTransform();

exports.handler = dataConnectTransform.handler.bind(dataConnectTransform);
