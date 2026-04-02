import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
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

  const getParams = {
    TableName: process.env.StateFormsTable,
    Key: { state_form },
    ConsistentRead: true,
  };

  const result = await dynamoDb.get(getParams);
  if (!result.Item) {
    return notFound();
  }

  const updateParams = {
    TableName: process.env.StateFormsTable,
    Key: { state_form },
    UpdateExpression:
      "SET last_modified = :last_modified, last_modified_by = :last_modified_by, enrollmentCounts = :enrollmentCounts",
    ExpressionAttributeValues: {
      ":last_modified": new Date().toISOString(),
      ":last_modified_by": request.user.username,
      ":enrollmentCounts": {
        year,
        type: EnrollmentTypes[form],
        count: request.body.totalEnrollment,
      },
    },
  };

  await dynamoDb.update(updateParams);

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
