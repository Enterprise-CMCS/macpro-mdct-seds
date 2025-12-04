export default [
  {
    topicPrefix: "aws.mdct.seds.cdc",
    version: ".v0",
    numPartitions: 1,
    replicationFactor: 3,
    topics: [
      ".auth-user",
      ".form-answers",
      ".form-questions",
      ".form-templates",
      ".forms",
      ".state-forms",
      ".states",
    ],
  },
];
