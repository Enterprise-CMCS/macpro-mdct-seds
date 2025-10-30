const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

/**
 * This migration will remove the ambiguity from state form statuses.
 *
 * Prior to the migration, each form had status_id, status, and not_applicable.
 * Spreading the status across three fields in this way led to problems:
 * a given status_id could correspond to different status descriptions,
 * and the not_applicable flag didn't correspond 1:1 with status "Not Required".
 *
 * After the migration, we will have only one field: status_id.
 * Status descriptions, and whether or not the form appears as required,
 * will be derived from status_id on the front end at run time.
 *
 * More specifically, the migration will make these changes:
 * - In Progress will move from id 1 or 2, to just id 1.
 * - Provisional Certified will move from id 3 to id 2.
 * - Final Certified will move from id 4 to 3.
 * - 4 will become the dedicated status_id for Not Required.
 * - Forms with indications that someone intended to mark them as Not Required
 *   will be be moved to Not Required. Note that state users can, and will still
 *   be able to move these forms from Not Required back to In Progress.
 *
 * This table summarizes the changes, with the number of production forms
 * we expect to find with each combination of values.
 *
 * | Prior: id, n/a, status  | After: id (status) | Count |
 * |-------------------------|--------------------|-------|
 * | 1, false, "In Progress" | 1 (In Progress)    | ~1500 |
 * | 2, false, "In Progress" | 1 (In Progress)    | ~2900 |
 * | 3, false, "Prov. Cert." | 2 (Prov. Cert.)    |  ~160 |
 * | 4, false, "Final Cert." | 3 (Final Cert.)    | ~3600 |
 * | 4, false, "Not Req."    | 4 (Not Required)   |     3 |
 * | 1, true, "In Progress"  | 4 (Not Required)*  |     9 |
 * | 2, true, "In Progress"  | 4 (Not Required)   |     0 |
 * | 3, true, "Prov. Cert."  | 4 (Not Required)   |     0 |
 * | 4, true, "Final Cert."  | 4 (Not Required)   |     5 |
 * | 4, true, "Not Req."     | 4 (Not Required)   |  ~350 |
 * * The exception is MA-2021-1-64.21E, which will go from 1/true/InPrg -> 1
 *
 * Note that this migration has a bit of history.
 * - It was run in DEV on Sep 16, 2025.
 * - It was then reverted (more or less) by unMigrateStateFormStatus on Oct 3.
 * - (The next three bullets were speculatively & boldly written on Oct 16.)
 * - It was then re-run in DEV on Oct 17.
 * - It was run in VAL the week of Oct 20.
 * - It was run in PROD on Oct 22.
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
  const { state_form, status_id, status, not_applicable } = stateForm;

  if (not_applicable === undefined && status === undefined) {
    // This form has already been migrated; no update necessary.
    return false;
  }

  if (
    typeof status_id !== "number" ||
    typeof status !== "string" ||
    typeof not_applicable !== "boolean" ||
    (status_id === 1 && status !== "In Progress") ||
    (status_id === 2 && status !== "In Progress") ||
    (status_id === 3 &&
      status !== "Provisional Data Certified and Submitted") ||
    (status_id === 4 &&
      status !== "Final Data Certified and Submitted" &&
      status !== "Not Required")
  ) {
    // This form does not look like I expected, so I refuse to touch it.
    throw new Error(
      `Form ${state_form} is in a bad status! [status_id, status, not_applicable] = ${JSON.stringify(
        [status_id, status, not_applicable]
      )}`
    );
  }

  if (
    (not_applicable && status !== "Not Required") ||
    (!not_applicable && status === "Not Required")
  ) {
    /*
     * This is an odd one; make a note of it before updating.
     * We expect to see fewer than 20 of these,
     * and we want all of their IDs logged out.
     */
    console.warn(
      `${logPrefix()}Form ${state_form} has an outlier status. [status_id, status, not_applicable] = ${JSON.stringify(
        [status_id, status, not_applicable]
      )}`
    );
  }

  if (state_form === "MA-2021-1-64.21E") {
    /*
     * This is our one form with contradictory status info,
     * but which actually has some answers filled in.
     * The rest will go to Not Required, but this one stays In Progress.
     */
    if (
      status_id !== 1 ||
      not_applicable !== true ||
      status !== "In Progress"
    ) {
      throw new Error(
        `Form MA-2021-1-64.21E has changed since we last checked it! Re-examine and re-evaluate.`
      );
    }
    stateForm.status_id = 1;
    delete stateForm.status;
    delete stateForm.not_applicable;
    return true;
  }

  // Let's make the update.
  if (not_applicable || status === "Not Required") {
    stateForm.status_id = 4;
  } else if (status_id === 2) {
    stateForm.status_id = 1;
  } else if (status_id === 3) {
    stateForm.status_id = 2;
  } else if (status_id === 4) {
    stateForm.status_id = 3;
  }
  delete stateForm.status;
  delete stateForm.not_applicable;
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
  throw new Error("Stop. Talk to Ben. And/or read his copious comments.");

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
