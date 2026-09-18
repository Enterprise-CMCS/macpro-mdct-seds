const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

/**
 * This script ensures the correctness of all enrollment totals.
 *
 * What: In the form-answers table for forms 21E and 64.21E, in Q4 of the year,
 * in question 7 for an age range, we have the total enrollment for that range.
 * In the state-forms table, we have the total across all age ranges.
 * This total is automatically calculated every time the form-answers are saved.
 *
 * Why: SEDS used to have a button admins could click to recalculate totals.
 * It would re-scan all answers and recompute the sums.
 * But there was never a need for this, due to the auto-calculate on save.
 * Ultimately we removed that button. This script is all that's left,
 * for reference and "just in case" we ever want to run it manually.
 * We have no plans to do so.
 */

/*
 * ENVIRONMENT VARIABLES TO SET:
 * STATE_FORMS_TABLE_NAME: the name of the state-forms table in Dynamo
 * FORM_ANSWERS_TABLE_NAME: the name of the form-answers table in Dynamo
 * DRY_RUN: "false" to actually write totals;
 *   omit or use any other value to run an audit.
 * [anything needed for AWS auth, if not local]
 */
const { STATE_FORMS_TABLE_NAME, FORM_ANSWERS_TABLE_NAME, DRY_RUN } =
  process.env;

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

/**
 * Update this state form object in memory if necessary.
 * @returns `true` if a change was made, `false` if no change is needed.
 */
async function updateEnrollmentTotals(stateForm) {
  const getRequests = ["0000", "0001", "0105", "0612", "1318"]
    .map((ageRange) => `${stateForm.state_form}-${ageRange}-07`)
    .map((answer_entry) => getAnswer(answer_entry));
  const answers = await Promise.all(getRequests);
  const rows = answers.flatMap((answer) => answer?.rows ?? []);

  let count = 0;
  for (let row of rows) {
    for (let value of Object.values(row)) {
      if (!isNaN(value)) {
        count += value;
      }
    }
  }

  const year = stateForm.year;
  const type = { "21E": "separate", "64.21E": "expansion" }[stateForm.form];
  const updatedEnrollmentCounts = { type, year, count };

  if (updatedEnrollmentCounts.count === stateForm.enrollmentCounts?.count) {
    // The total has already been calculated correctly. No update needed.
    return false;
  }

  if (DRY_RUN !== "false") {
    const id = stateForm.state_form;
    const oldCount = stateForm.enrollmentCounts?.count ?? "____";
    console.log(`${logPrefix()}${id}: ${oldCount} -> ${count}`);
  }

  stateForm.enrollmentCounts = updatedEnrollmentCounts;
  return true;
}

export const getAnswer = async (answer_entry) => {
  const response = await dynamoDb.get({
    TableName: FORM_ANSWERS_TABLE_NAME,
    Key: { answer_entry },
  });
  return response.Item;
};

/** Scan ALL state forms (any year) which contain annual enrollment totals. */
async function* scanFormsWithTotals() {
  console.log(`${logPrefix()}Scanning...`);
  let pageNumber = 0;
  let totalFormCount = 0;
  for await (let page of paginateScan(
    { client },
    {
      TableName: STATE_FORMS_TABLE_NAME,
      FilterExpression: "quarter = :quarter AND form IN (:f1, :f2)",
      ExpressionAttributeValues: {
        ":quarter": 4,
        ":f1": "21E",
        ":f2": "64.21E",
      },
      ConsistentRead: true,
    }
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
  for await (let stateForm of scanFormsWithTotals()) {
    const needsUpdate = await updateEnrollmentTotals(stateForm);
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
      `Batch write failed! The following forms were not updated: ${ids.join(", ")}`
    );
  }
}

(async function () {
  let updatedCount = 0;
  const writeUpdates = DRY_RUN === "false";
  if (writeUpdates) {
    console.log("RUNNING LIVE. WILL WRITE TO THE DATABASE IF NEEDED.");
  } else {
    console.log("Performing a dry run. Will not write to the database.");
  }

  try {
    let batch = [];

    for await (let stateForm of formsToUpdate()) {
      batch.push(stateForm);
      if (batch.length === 25) {
        if (writeUpdates) {
          await sendBatch(batch);
        }
        updatedCount += 25;
        batch = [];
      }
    }

    if (batch.length > 0) {
      if (writeUpdates) {
        await sendBatch(batch);
      }
      updatedCount += batch.length;
    }

    console.log(
      `${logPrefix()}Found ${updatedCount} state forms in need of update.`
    );
    if (writeUpdates) {
      console.log(`${logPrefix()}All updates successful.`);
    }
  } catch (error) {
    console.error(error);
    if (writeUpdates) {
      console.log(
        // "at least" because the updatedCount may be short by up to 24 items,
        // depending on how much of a batch failed.
        `${logPrefix()}Updated at least ${updatedCount} state forms before exiting.`
      );
    }
  }
})();
