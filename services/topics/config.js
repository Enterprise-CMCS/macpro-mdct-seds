export default [
  {
    topicPrefix: "aws.mdct.seds.cdc",
    version: ".v0",
    numPartitions: 1,
    replicationFactor: 3,
    topics: [
      ".age-ranges",
      ".auth-user",
      ".auth-user-job-codes",
      ".auth-user-roles",
      ".auth-user-states",
      ".enrollment-counts",
      ".form-answers",
      ".form-questions",
      ".form-templates",
      ".forms",
      ".state-forms",
      ".states",
      ".status",
    ],
  },
];
