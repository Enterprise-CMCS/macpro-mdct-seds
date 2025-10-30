/* eslint-disable no-console */
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

/*
 * This undoes changes that were made in DEV by migrateStateFormStatus.js.
 *
 * That script consolidated 3 fields into 1. This script expands the 1 back out.
 * Those changes were ONLY MADE IN DEV, so this MUST NOT BE RUN in val or prod.
 *
 * Original (id/na/status) | Migrated | Un-migrated
 * ------------------------+----------+----------------------
 * 1/false/"In Progress"   | 1        | 2/false/"In Progress"
 * 2/false/"In Progress"   | 1        | 2/false/"In Progress"
 * 3/false/"Prov. Cert"    | 2        | 3/false/"Prov. Cert"
 * 4/false/"Final Cert"    | 3        | 4/false/"Final Cert"
 * 4/true/"Not Required"   | 4        | 4/true/"Not Required"
 *
 * Notes
 * - We could get away with only 2 fields; the status string will be unused now.
 *   I am putting it back in DEV to maintain environmental parity.
 *   Since VAL and PROD will not have any migration, and thus will have all 3
 *   fields, DEV should have all three as well.
 * - Forms in DEV which originally had status_id 1 will now have status_id 2.
 *   I can't put them back to 1, because they're indistinguishable from those
 *   which originally had status_id 2. That's OK: 1 and 2 behave identically.
 * - I wish I could give Not Required a different status_id from Final Cert.
 *   But the whole reason for this migration is to prevent (for now) a migration
 *   in PROD. So I cannot deviate from existing forms' existing semantics.
 */

/*
 * ENVIRONMENT VARIABLES TO SET:
 * STATE_FORMS_TABLE_NAME: the name of the table in Dynamo
 * [anything needed for AWS auth, if not local]
 */
const { STATE_FORMS_TABLE_NAME } = process.env;

const awsConfig = {
  region: "us-east-1",
  logger: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  fractionalSecondDigits: 3,
});
const logPrefix = () => dateFormatter.format(new Date()) + " | ";

function updateStatusFields(stateForm) {
  const { status_id, status, not_applicable } = stateForm;

  if (not_applicable !== undefined && status !== undefined) {
    // This form has already been migrated; no update necessary.
    return false;
  }

  // Given a migrated status_id, how do we un-migrate?
  const replacementMap = {
    1: { status_id: 2, not_applicable: false, status: "In Progress" },
    2: {
      status_id: 3,
      not_applicable: false,
      status: "Provisional Data Certified and Submitted",
    },
    3: {
      status_id: 4,
      not_applicable: false,
      status: "Final Data Certified and Submitted",
    },
    4: { status_id: 4, not_applicable: true, status: "Not Required" },
  };

  const replacement = replacementMap[status_id];
  stateForm.status_id = replacement.status_id;
  stateForm.not_applicable = replacement.not_applicable;
  stateForm.status = replacement.status;
  return true;
}

async function* iterateStateForms() {
  console.log(`${logPrefix()}Scanning...`);
  let pageNumber = 0;
  let totalFormCount = 0;
  for await (let page of paginateScan(
    { client },
    { TableName: STATE_FORMS_TABLE_NAME }
  )) {
    pageNumber += 1;
    let pageFormCount = 0;
    for (let stateForm of page.Items ?? []) {
      pageFormCount += 1;
      totalFormCount += 1;
      yield stateForm;
    }
    console.log(
      `${logPrefix()}Completed scan of page ${pageNumber}; ${pageFormCount} forms processed.`
    );
  }
  console.log(`${logPrefix()}Scan complete; ${totalFormCount} forms in all.`);
}

async function* formsToUpdate() {
  for await (let stateForm of iterateStateForms()) {
    const needsUpdate = updateStatusFields(stateForm);
    if (needsUpdate) {
      yield stateForm;
    }
  }
}

/**
 * Send a BatchWriteCommand to Put the given array of StateForm objects.
 * @param {object[]} batch
 */
async function sendBatch(batch) {
  const command = new BatchWriteCommand({
    RequestItems: {
      [STATE_FORMS_TABLE_NAME]: batch.map((Item) => ({
        PutRequest: { Item },
      })),
    },
  });
  const response = await client.send(command);
  const unprocessedItems = response.UnprocessedItems?.[STATE_FORMS_TABLE_NAME];
  if (unprocessedItems && unprocessedItems.length > 0) {
    const ids = unprocessedItems.map(
      (putRequest) => putRequest.Item.state_form
    );
    throw new Error(
      `Batch write failed! The following forms were not updated: ${ids.join(
        ", "
      )}`
    );
  }
}

(async function () {
  let updatedCount = 0;
  try {
    let batch = [];

    for await (let stateForm of formsToUpdate()) {
      batch.push(stateForm);
      if (batch.length === 25) {
        await sendBatch(batch);
        updatedCount += 25;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await sendBatch(batch);
      updatedCount += batch.length;
    }

    console.log(
      `${logPrefix()}Found ${updatedCount} state forms in need of update.`
    );
    console.log(`${logPrefix()}All updates successful.`);
  } catch (err) {
    console.error(err);
    // The updatedCount may be short by up to 24 items, depending on how much of a batch failed.
    console.log(
      `${logPrefix()}Updated at least ${updatedCount} state forms before exiting.`
    );
  }
})();
