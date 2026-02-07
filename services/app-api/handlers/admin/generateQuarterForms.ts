import handler from "../../libs/handler-lib.ts";
import { calculateFormQuarterFromDate } from "../../libs/time.ts";
import {
  FormStatus,
  APIGatewayProxyEvent,
  AuthenticatedRequest,
} from "../../shared/types.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import {
  FormAnswer,
  scanForAllFormIds,
  writeAllFormAnswers,
} from "../../storage/formAnswers.ts";
import { getTemplate, putTemplate } from "../../storage/formTemplates.ts";
import {
  scanQuestionsByYear,
  writeAllFormQuestions,
} from "../../storage/formQuestions.ts";
import {
  scanFormsByQuarter,
  StateForm,
  writeAllStateForms,
} from "../../storage/stateForms.ts";
import { formTypes } from "../../shared/formTypeList.ts";
import { stateList } from "../../shared/stateList.ts";
import { isIntegral } from "../../libs/parsing.ts";
import { AuthUser } from "../../storage/users.ts";

/** Called from the API; admin access required */
export const main = handler(parseParameters, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  return await generateQuarterForms(request);
});

/**
 * Called from a scheduled job. The scheduler will not provide a user token,
 * so we cannot (and don't need to) use the standard `handler()` wrapper.
 */
export const scheduled = async (event: APIGatewayProxyEvent) => {
  const parameters = parseParameters(event);
  const request = {
    parameters,
    user: {} as AuthUser,
    body: undefined,
  };
  return await generateQuarterForms(request);
};

/*
 * Generates initial form data and statuses for all states given a year and quarter
 */
const generateQuarterForms = async (
  request: AuthenticatedRequest<Parameters>
) => {
  let noMissingForms = true;

  const determineAgeRanges = (questionId: string) => {
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

  // If not specified, determine the reporting period from the current date.
  const currentQuarter = calculateFormQuarterFromDate(new Date());
  const specifiedYear = request.parameters.year ?? currentQuarter.year;
  const specifiedQuarter = request.parameters.quarter ?? currentQuarter.quarter;
  const restoreMissingAnswers = request.parameters.restore;

  // Search for existing stateForms
  const foundForms = await scanFormsByQuarter(specifiedYear, specifiedQuarter);
  const foundFormIds = new Set(foundForms.map((f) => f.state_form));

  const stateFormsToCreate: StateForm[] = [];

  // Loop through all states
  for (const state_id of stateList.map((st) => st.state_id)) {
    // Loop through form descriptions for each state
    for (const form of formTypes) {
      // Build lengthy strings
      const stateFormString = `${state_id}-${specifiedYear}-${specifiedQuarter}-${form.form}`;

      if (!foundFormIds.has(stateFormString)) {
        noMissingForms = false;
        // Add item to array for batching later
        stateFormsToCreate.push({
          state_form: stateFormString,
          status_date: new Date().toISOString(),
          year: specifiedYear,
          state_comments: [{ type: "text_multiline", entry: "" }],
          form_id: form.form_id,
          last_modified_by: "seed",
          status_modified_by: "seed",
          created_by: "seed",
          validation_percent: "0.03",
          status_id: FormStatus.InProgress,
          form: form.form,
          program_code: "All",
          state_id: state_id,
          created_date: new Date().toISOString(),
          form_name: form.form_name,
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
    const message = `All forms, for Quarter ${specifiedQuarter} of ${specifiedYear}, previously existed. No new forms added.`;
    console.log(message);
    return ok(message);
  }

  if (formAnswersToCreate.length > 0) {
    await writeAllFormAnswers(formAnswersToCreate);
  }

  return ok(
    `Forms successfully created for Quarter ${specifiedQuarter} of ${specifiedYear}.`
  );
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

type Parameters = {
  year: number | undefined;
  quarter: number | undefined;
  restore: boolean;
};

function parseParameters(evt: APIGatewayProxyEvent): Parameters {
  const yearStr = evt.queryStringParameters?.year;
  const year = isIntegral(yearStr) ? Number(yearStr) : undefined;

  const quarterStr = evt.queryStringParameters?.quarter;
  const quarter = isIntegral(quarterStr) ? Number(quarterStr) : undefined;

  const restoreStr = evt.queryStringParameters?.restore;
  const restore = restoreStr === "true";

  return { year, quarter, restore };
}
