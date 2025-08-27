const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  PutCommand,
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
 * | 2, false, "In Progress" | 1 (In Progress)    | ~2600 |
 * | 3, false, "Prov. Cert." | 2 (Prov. Cert.)    |  ~150 |
 * | 4, false, "Final Cert." | 3 (Final Cert.)    | ~3000 |
 * | 4, false, "Not Req."    | 4 (Not Required)   |     3 |
 * | 1, true, "In Progress"  | 4 (Not Required)   |     7 |
 * | 2, true, "In Progress"  | 4 (Not Required)   |     0 |
 * | 3, true, "Prov. Cert."  | 4 (Not Required)   |     0 |
 * | 4, true, "Final Cert."  | 4 (Not Required)   |     4 |
 * | 4, true, "Not Req."     | 4 (Not Required)   |  ~300 |
 * 
 */

/*
 * ENVIRONMENT VARIABLES TO SET:
 * STATE_FORMS_TABLE_NAME: the name of the table in Dynamo
 * DYNAMODB_URL: the local URL if local; undefined otherwise
 * [anything needed for AWS auth, if not local]
 */
const {
  STATE_FORMS_TABLE_NAME,
  DYNAMODB_URL,
} = process.env;

const logger = {
  debug: () => {},
  info: console.info,
  warn: console.warn,
  error: console.error,
};

// TODO: This config workd under Serverless. Does it still work under CDK?
const localConfig = {
  endpoint: DYNAMODB_URL,
  region: "localhost",
  credentials: {
    accessKeyId: "LOCALFAKEKEY", // pragma: allowlist secret
    secretAccessKey: "LOCALFAKESECRET", // pragma: allowlist secret
  },
  logger,
};

const awsConfig = {
  region: "us-east-1",
  logger,
};

const getConfig = () => {
  return DYNAMODB_URL ? localConfig : awsConfig;
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(getConfig()));

function updateStatusFields (stateForm) {
  const { state_form, status_id, status, not_applicable } = stateForm;

  if (not_applicable === undefined && status === undefined) {
    // This form has already been migrated; no update necessary.
    return false;
  }

  if (
    (typeof status_id !== "number" || typeof status !== "string" || typeof not_applicable !== "boolean") ||
    (status_id === 1 && status !== "In Progress") ||
    (status_id === 2 && status !== "In Progress") ||
    (status_id === 3 && status !== "Provisional Data Certified and Submitted") ||
    (status_id === 4 && status !== "Final Data Certified and Submitted" && status !== "Not Required")
  ) {
    // This form does not look like I expected, so I refuse to touch it.
    throw new Error(`Form ${state_form} is in a bad status! [status_id, status, not_applicable] = ${JSON.stringify([status_id, status, not_applicable])}`);
  }

  if ((not_applicable && status !== "Not Required") ||
    (!not_applicable && status === "Not Required")
  ) {
    // This is an odd one; make a note of it before updating.
    console.warn(`Form ${state_form} has an outlier status. [status_id, status, not_applicable] = ${JSON.stringify([status_id, status, not_applicable])}`);
  }

  // Let's make the update.
  if (not_applicable || status === "Not Required") {
    stateForm.status_id = 4;
  }
  else if (status_id === 2) {
    stateForm.status_id = 1;
  }
  else if (status_id === 3) {
    stateForm.status_id = 2;
  }
  else if (status_id === 4) {
    stateForm.status_id = 3;
  }
  delete stateForm.status;
  delete stateForm.not_applicable;
  // TODO maybe also add an explicit `wasMigratedForStatusId` flag, which we can track now & delete later?
  return true;
}

async function * iterateStateForms () {
  console.log("Scanning...");
  let pageNumber = 0;
  let totalFormCount = 0;
  for await (let page of paginateScan({ client }, { TableName: STATE_FORMS_TABLE_NAME })) {
    pageNumber += 1;
    let pageFormCount = 0;
    for (let stateForm of (page.Items ?? [])) {
      pageFormCount += 1;
      totalFormCount += 1;
      yield stateForm;
    }
    console.log(`Completed scan of page ${pageNumber}; ${pageFormCount} forms processed.`);
  }
  console.log(`Scan complete; ${totalFormCount} forms in all.`);
}

(async function () {
  let updatedCount = 0;
  try {
    for await (let stateForm of iterateStateForms()) {
      const didUpdate = updateStatusFields(stateForm);
      if (didUpdate) {
        await client.send(new PutCommand({
          // TODO double check
          TableName: STATE_FORMS_TABLE_NAME,
          Item: stateForm,
        }));
        updatedCount += 1;
      }
    }
    console.log(`Found ${updatedCount} state forms in need of update.`);
    console.log("All updates successful.");
  }
  catch (err) {
    console.error(err);
    console.log(`Updated ${updatedCount} state forms before exiting.`);
  }
})();
