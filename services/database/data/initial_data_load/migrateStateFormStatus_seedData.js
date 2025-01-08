const fs = require("node:fs");

/**
 * See services/database/scripts/migrateStateFormStatus.js for an explanation.
 * This is that, but for local see data files.
 */

const stateFormSeedDataFiles = [
  "state_forms_2020.json",
  "state_forms_2021Q1.json"
]

for (let fileName of stateFormSeedDataFiles) {
  const fileContents = fs.readFileSync(fileName, { encoding: "utf-8" });
  const formArray = JSON.parse(fileContents);
  for (let stateForm of formArray) {
    updateStatusFields(stateForm);
  }
  const updatedFileContents = JSON.stringify(formArray, null, 2);
  fs.writeFileSync(fileName, updatedFileContents);
}

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
    stateForm.status_id = 2
  }
  else if (status_id === 4) {
    stateForm.status_id = 3;
  }
  delete stateForm.status;
  delete stateForm.not_applicable;
  return true;
}
