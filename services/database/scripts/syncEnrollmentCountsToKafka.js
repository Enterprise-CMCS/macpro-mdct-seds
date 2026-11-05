const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

/**
 * Re-publish SEDS enrollment counts to Kafka, and by proxy to CARTS.
 *
 * CARTS fills Section 2 Part 1 from the `aws.mdct.seds.cdc.state-forms.v0`
 * topic, keeping only Q4 21E / 64.21E state forms which have `enrollmentCounts`,
 * for the current and prior federal fiscal year.
 *
 * This script touches those records by setting lastSynced so that the
 * state-forms DynamoDB stream fires and postKafkaData republishes them.
 * Nothing else about the records changes.
 *
 * Use it when CARTS has missed messages and you need to re-sync so CARTS
 * catchs backup. A good habit to note, always do a dry run first ;).
 *
 * ENV variables you'll need to makesure are set:
 * STATE_FORMS_TABLE_NAME: the name of the table in Dynamo ({env}-state-forms)
 * MODIFIED_FROM: only forms last modified on or after this date, e.g. 2026-03-23
 * MODIFIED_TO (Optional): ...and on or before this date. A bare date runs to
 *   the end of that day. Leave it off to go right up to now.
 * DRY_RUN: set to "true" to list the matching forms without writing anything
 *
 * Example call of this script:
 *   STATE_FORMS_TABLE_NAME=val-state-forms MODIFIED_FROM=2026-03-23 DRY_RUN=true \
 *     node services/database/scripts/syncEnrollmentCountsToKafka.js
 */
const { STATE_FORMS_TABLE_NAME, MODIFIED_FROM, MODIFIED_TO, DRY_RUN } =
  process.env;

const awsConfig = {
  region: "us-east-1",
  endpoint: process.env.AWS_ENDPOINT_URL,
  logger: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));

// last_modified is stored as an ISO string, so the bounds need to be too.
const toIso = (value) => new Date(value).toISOString();

const buildFilter = ({ modifiedFrom, modifiedTo }) => {
  const conditions = [
    "quarter = :q",
    "form IN (:f1, :f2)",
    "attribute_exists(enrollmentCounts)",
    "#last_modified >= :from",
  ];
  const values = {
    ":q": 4,
    ":f1": "21E",
    ":f2": "64.21E",
    ":from": modifiedFrom,
  };

  if (modifiedTo) {
    conditions.push("#last_modified <= :to");
    values[":to"] = modifiedTo;
  }

  return {
    FilterExpression: conditions.join(" AND "),
    ExpressionAttributeNames: { "#last_modified": "last_modified" },
    ExpressionAttributeValues: values,
  };
};

const findEnrollmentCountForms = async (tableName, filter) => {
  const pages = paginateScan(
    { client },
    { TableName: tableName, ...buildFilter(filter) }
  );

  const forms = [];
  for await (const page of pages) {
    forms.push(...(page.Items ?? []));
  }
  return forms.toSorted((a, b) => a.state_form.localeCompare(b.state_form));
};

const main = async () => {
  if (!STATE_FORMS_TABLE_NAME) {
    throw new Error("STATE_FORMS_TABLE_NAME is required");
  }
  if (!MODIFIED_FROM) {
    throw new Error("MODIFIED_FROM is required");
  }
  const filter = {
    modifiedFrom: toIso(MODIFIED_FROM),
    // a bare MODIFIED_TO date should cover that whole day
    modifiedTo: MODIFIED_TO
      ? toIso(
          MODIFIED_TO.includes("T")
            ? MODIFIED_TO
            : `${MODIFIED_TO}T23:59:59.999Z`
        )
      : undefined,
  };
  const dryRun = DRY_RUN === "true";
  const lastSynced = new Date().toISOString();

  const forms = await findEnrollmentCountForms(STATE_FORMS_TABLE_NAME, filter);

  const window = `modified from ${filter.modifiedFrom}${filter.modifiedTo ? ` to ${filter.modifiedTo}` : ""}`;
  console.log(
    `Found ${forms.length} Q4 21E/64.21E forms with enrollment counts (${window}) in ${STATE_FORMS_TABLE_NAME}`
  );
  for (const form of forms) {
    console.log(
      `  ${form.state_form}  ${form.enrollmentCounts?.type}  count=${form.enrollmentCounts?.count}  modified ${form.last_modified}`
    );
  }

  if (dryRun) {
    console.log("DRY_RUN=true, You Will Not Write (Anything to the db)");
    return;
  }

  for (const form of forms) {
    await client.send(
      new PutCommand({
        TableName: STATE_FORMS_TABLE_NAME,
        Item: { ...form, lastSynced },
      })
    );
  }
  console.log(`Re-synced ${forms.length} forms with lastSynced=${lastSynced}`);
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { main, findEnrollmentCountForms };
