import handler from "../../libs/handler-lib.ts";
import { canWriteAnswersForState } from "../../auth/authConditions.ts";
import {
  badRequest,
  forbidden,
  notFound,
  ok,
} from "../../libs/response-lib.ts";
import { readFormIdentifiersFromPath } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";
import { FormTypes } from "../../shared/types.ts";
import {
  getStateForm,
  updateEnrollmentCounts,
} from "../../storage/stateForms.ts";

export const main = handler(readFormIdentifiersFromPath, async (request) => {
  const { state, year, quarter, form } = request.parameters;

  if (form !== FormTypes["21E"] && form !== FormTypes["64.21E"]) {
    return ok();
  }

  if (!canWriteAnswersForState(request.user, state)) {
    return forbidden();
  }

  if (!isValidBody(request.body)) {
    return badRequest();
  }

  const state_form = `${state}-${year}-${quarter}-${form}`;

  if ((await getStateForm(state_form)) !== undefined) {
    return notFound();
  }

  updateEnrollmentCounts({
    state_form,
    last_modified: new Date().toISOString(),
    last_modified_by: request.user.username,
    enrollmentCounts: {
      year,
      type: EnrollmentTypes[form],
      count: request.body.totalEnrollment,
    },
  });

  return ok();
});

const EnrollmentTypes = {
  [FormTypes["21E"]]: "separate",
  [FormTypes["64.21E"]]: "expansion",
} as const;

type RequestBody = {
  totalEnrollment: number;
};

const isValidBody = (body: unknown): body is RequestBody => {
  if (!body || "object" !== typeof body) {
    logger.warn("body is required.");
    return false;
  }

  if (
    !("totalEnrollment" in body) ||
    "number" !== typeof body.totalEnrollment
  ) {
    logger.warn("body.totalEnrollment must be a number.");
    return false;
  }

  return true;
};
