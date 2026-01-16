import handler from "../../../libs/handler-lib.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import { calculateFormQuarterFromDate } from "../../../libs/time.ts";
import { FormStatus } from "../../../shared/types.ts";
import { ok } from "../../../libs/response-lib.ts";
import {
  FormAnswer,
  scanForAllFormIds,
  writeAllFormAnswers,
} from "../../../storage/formAnswers.ts";
import { getTemplate, putTemplate } from "../../../storage/formTemplates.ts";
import {
  scanQuestionsByYear,
  writeAllFormQuestions,
} from "../../../storage/formQuestions.ts";
import {
  scanFormsByQuarter,
  StateForm,
  writeAllStateForms,
} from "../../../storage/stateForms.ts";
import { formTypes } from "../../../shared/formTypeList.ts";
import { stateList } from "../../../shared/stateList.ts";

/** Called from the API; admin access required */
export const main = handler(async (event) => {
  await authorizeAdmin(event);
  return await generateQuarterForms(event);
});

/** Called from a scheduled job; no specific user privileges required */
export const scheduled = handler(async (event) => {
  return await generateQuarterForms(event);
});

/*
 * Generates initial form data and statuses for all states given a year and quarter
 */
const generateQuarterForms = async (event: any) => {
  let noMissingForms = true;

  const determineAgeRanges = (questionId: any) => {
    const year = questionId.split("-")[0];
    const form = questionId.split("-")[1];

    let ageRanges;
    if (
      parseInt(year) === 2020 ||
      parseInt(year) === 2019 ||
      parseInt(year) === 2018
    ) {
      switch (form) {
        case "GRE":
          ageRanges = [
            { key: "0018", label: "Conception through age 18 years" },
          ];
          break;
        case "21PW":
          ageRanges = [
            { key: "1964", label: "Age 19 years through age 64 years" },
          ];
          break;
        case "64.21E":
          ageRanges = [
            { key: "0001", label: "Birth through age 12 months" },
            { key: "0105", label: "Age 1 year through age 5 years" },
            { key: "0612", label: "Age 6 years through age 12 years" },
            { key: "1318", label: "Age 13 years through age 18 years" },
          ];
          break;
        case "21E":
          ageRanges = [
            { key: "0000", label: "Conception to birth" },
            { key: "0001", label: "Birth through age 12 months" },
            { key: "0105", label: "Age 1 year through age 5 years" },
            { key: "0612", label: "Age 6 years through age 12 years" },
            { key: "1318", label: "Age 13 years through age 18 years" },
          ];
          break;
        case "64.EC":
          ageRanges = [
            { key: "0001", label: "Birth through age 12 months" },
            { key: "0105", label: "Age 1 year through age 5 years" },
            { key: "0612", label: "Age 6 years through age 12 years" },
            { key: "1318", label: "Age 13 years through age 18 years" },
            { key: "1920", label: "Age 19 years through age 20 years" },
          ];
          break;
      }
    }
    return ageRanges;
  };

  // Get year and quarter from request, or the current date for automated jobs
  let specifiedYear;
  let specifiedQuarter;
  let restoreMissingAnswers = false;

  // If a data object is sent use those values.
  if (event.body && event.body !== "undefined") {
    let data =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    if (data) {
      specifiedYear = parseInt(data.year);
      specifiedQuarter = data.quarter;
      restoreMissingAnswers = !!data.restoreMissingAnswers;
    }
  }

  // If not specified, determine the reporting period from the current date.
  const currentQuarter = calculateFormQuarterFromDate(new Date());
  specifiedYear = specifiedYear || currentQuarter.year;
  specifiedQuarter = specifiedQuarter || currentQuarter.quarter;

  // Search for existing stateForms
  const foundForms = await scanFormsByQuarter(specifiedYear, specifiedQuarter);
  const foundFormIds = new Set(foundForms.map((f) => f.state_form));

  const stateFormsToCreate: StateForm[] = [];

  // Loop through all states
  for (const state in stateList) {
    // Loop through form descriptions for each state
    for (const form in formTypes) {
      // Build lengthy strings
      const stateFormString = `${stateList[state].state_id}-${specifiedYear}-${specifiedQuarter}-${formTypes[form].form}`;

      if (!foundFormIds.has(stateFormString)) {
        noMissingForms = false;
        // Add item to array for batching later
        stateFormsToCreate.push({
          state_form: stateFormString,
          status_date: new Date().toISOString(),
          year: specifiedYear,
          state_comments: [{ type: "text_multiline", entry: "" }],
          form_id: formTypes[form].form_id,
          last_modified_by: "seed",
          status_modified_by: "seed",
          created_by: "seed",
          validation_percent: "0.03",
          status_id: FormStatus.InProgress,
          form: formTypes[form].form,
          program_code: "All",
          state_id: stateList[state].state_id,
          created_date: new Date().toISOString(),
          form_name: formTypes[form].form_name,
          last_modified: new Date().toISOString(),
          quarter: specifiedQuarter,
        });
      }
    }
  }

  const newFormIds = new Set(stateFormsToCreate.map((f) => f.state_form));

  console.log(`Saving ${stateFormsToCreate.length} state forms`);
  if (stateFormsToCreate.length > 0) {
    await writeAllStateForms(stateFormsToCreate);
  }

  // -----------------------------------------------------------------

  const allQuestions = await getOrCreateQuestions(specifiedYear);

  const formAnswersToCreate: FormAnswer[] = [];
  const formIdsWithAnswers = restoreMissingAnswers
    ? new Set(await scanForAllFormIds())
    : new Set();

  // Loop through all states, then all questions to return a new record with correct state info
  for (const state in stateList) {
    // Loop through each question
    for (const question in allQuestions) {
      // Get age range array
      let ageRanges =
        allQuestions[question].age_ranges ??
        determineAgeRanges(allQuestions[question].question);
      // Loop through each age range and insert row
      if (!ageRanges) continue;

      for (const range in ageRanges) {
        // Get reusable values
        const currentState = stateList[state].state_id;
        const currentForm = allQuestions[question].question.split("-")[1];
        const currentAgeRangeId = ageRanges[range].key;
        const currentAgeRangeLabel = ageRanges[range].label;
        const currentQuestionNumber =
          allQuestions[question].question.split("-")[2];
        const answerEntry = `${currentState}-${specifiedYear}-${specifiedQuarter}-${currentForm}-${currentAgeRangeId}-${currentQuestionNumber}`;
        const questionID = `${specifiedYear}-${currentForm}-${currentQuestionNumber}`;
        const stateFormID = `${currentState}-${specifiedYear}-${specifiedQuarter}-${currentForm}`;

        // If the stateFormID is in the array of newly created forms, the questions/answers will be created
        // Does not consider state forms generated missing questions & answers, unless flag set on manual invocation
        const isGeneratingStateForm = newFormIds.has(stateFormID);
        const missingAnswers =
          restoreMissingAnswers && !formIdsWithAnswers.has(stateFormID);

        if (isGeneratingStateForm || missingAnswers) {
          if (!isGeneratingStateForm && missingAnswers) {
            console.log(`    - Restoring answer entry: ${answerEntry}`);
          }
          noMissingForms = false;
          formAnswersToCreate.push({
            answer_entry: answerEntry,
            age_range: currentAgeRangeLabel,
            rangeId: currentAgeRangeId,
            question: questionID,
            state_form: stateFormID,
            last_modified_by: "seed",
            created_date: new Date().toISOString(),
            rows: allQuestions[question].rows,
            last_modified: new Date().toISOString(),
            created_by: "seed",
          });
        }
      }
    }
  }

  // This will only be true if neither !foundForms.includes statements pass,
  // Everything was found in the list, nothing is to be created
  if (noMissingForms) {
    const message = `All forms, for Quarter ${specifiedQuarter} of ${specifiedYear}, previously existed. No new forms added`;
    console.log(message);
    return ok({
      status: 204,
      message: message,
    });
  }

  if (formAnswersToCreate.length > 0) {
    await writeAllFormAnswers(formAnswersToCreate);
  }

  return ok({
    status: 200,
    message: `Forms successfully created for Quarter ${specifiedQuarter} of ${specifiedYear}`,
  });
};

export const getOrCreateFormTemplate = async (year: number) => {
  let response = await getTemplate(year);
  if (response) {
    return response.template;
  }

  response = await getTemplate(year - 1);
  if (!response) {
    throw new Error(`No template found for ${year} or ${year - 1}!`);
  }

  const newTemplate = JSON.parse(
    JSON.stringify(response).replaceAll(`${year - 1}`, `${year}`)
  );

  await putTemplate({
    ...newTemplate,
    lastSynced: new Date().toISOString(),
  });

  return newTemplate.template;
};

export const getOrCreateQuestions = async (year: number) => {
  let questions = await scanQuestionsByYear(year);
  if (questions.length > 0) {
    return questions;
  }

  questions = (await getOrCreateFormTemplate(year)).map((question: any) => ({
    ...question,
    created_date: new Date().toISOString(),
    last_modified: new Date().toISOString(),
  }));

  await writeAllFormQuestions(questions);

  return questions;
};
