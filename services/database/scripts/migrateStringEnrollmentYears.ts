import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { logger } from "./logger.js";
import {
  batchWriteItems,
  dynamoClient,
  iterateScan,
} from "./migrationUtils.js";

/*
 * From March 2026 until October 2026, SEDS had a bug which allowed
 * stateForm.enrollmentCount.year to be saved as a string.
 * This is wrong by itself, but also caused problems for prior years in CARTS.
 *
 * This migration fixes all of the incorrect data in SEDS,
 * and touches all of the forms which had problems in CARTS.
 * This will re-send them through Kafka, and CARTS will have the correct data.
 *
 * Environment variables:
 * - StateFormsTable: The name of the state-forms table in this environment
 * - DRY_RUN: Set to any truthy string to prevent database writes.
 *            Omit for the "live" invocation.
 * - Anything needed for AWS auth
 *
 * Example invocation:
 * StateFormsTable=production-state-forms DRY_RUN=true \
 *   node migrateStringEnrollmentYears.ts
 */

/** Abbreviated version of the real type defined in the app. */
type StateForm = {
  state_form: string;
  state_id: string;
  year: number;
  quarter: number;
  form: string;
  enrollmentCounts?: {
    type: "separate" | "expansion";
    year: number;
    count: number;
  };
};

const TableName = process.env.StateFormsTable!;
const isDryRun = !!process.env.DRY_RUN;

const main = async () => {
  logger.info("Beginning migration...");
  const badFormIterator = getStringStateForms();
  const overwrittenFormIterator = getOverwrittenStateForms();
  if (isDryRun) {
    logger.info(
      "This is a DRY RUN. No changes will be saved. The following measures WOULD be modified:"
    );

    logger.info("These forms will have their year corrected:");
    for await (const form of badFormIterator) {
      logger.debug(keySelector(form));
    }

    logger.info("These forms will be synced through Kafka:");
    for await (const form of overwrittenFormIterator) {
      logger.debug(keySelector(form));
    }
  } else {
    logger.warn("This is a LIVE RUN. Changes WILL be saved to the database.");
    await batchWriteItems({
      itemIterator: badFormIterator,
      TableName,
      keySelector,
    });
    await batchWriteItems({
      itemIterator: overwrittenFormIterator,
      TableName,
      keySelector,
    });
  }
  logger.info("Complete!");
};

const keySelector = (x: StateForm) => x.state_form;

const getStringStateForms = async function* () {
  const forms = iterateScan<StateForm>({}, { TableName });
  for await (const form of forms) {
    const didModify = modifyForm(form);
    if (didModify) {
      yield form;
    }
  }
};

/**
 * Change the given form, modifying the object in place.
 * @returns `true` if a change was made, `false` otherwise.
 */
const modifyForm = (form: StateForm) => {
  if (!form.enrollmentCounts?.year) return false;
  if (typeof form.enrollmentCounts.year === "number") return false;

  form.enrollmentCounts.year = Number(form.enrollmentCounts.year);
  if (form.enrollmentCounts.year !== form.year) {
    throw new Error("Enrollment count year should match form year");
  }

  return true;
};

const formsWithOverwrittenEnrollmentCounts = [
  "AR-2025-4-64.21E",
  "AR-2025-4-21E",
  "DE-2025-4-21E",
  "FL-2025-4-64.21E",
  "FL-2025-4-21E",
  "GA-2025-4-64.21E",
  "MI-2025-4-21E",
  "MO-2025-4-64.21E",
  "MO-2025-4-21E",
  "MT-2025-4-64.21E",
  "MT-2025-4-21E",
  "NV-2025-4-64.21E",
  "NV-2025-4-21E",
  "TN-2025-4-64.21E",
  "TN-2025-4-21E",
  "VA-2025-4-64.21E",
  "VA-2025-4-21E",
  "WA-2025-4-21E",
];
const getOverwrittenStateForms = async function* () {
  const lastSynced = new Date().toISOString();
  for await (const state_form of formsWithOverwrittenEnrollmentCounts) {
    const response = await dynamoClient.send(
      new GetCommand({
        TableName,
        Key: { state_form },
      })
    );
    const form = response.Item as StateForm | undefined;
    if (!form) {
      throw new Error("Could not find state form " + state_form);
    }
    (form as any).lastSynced = lastSynced;
    yield form;
  }
};

main();
