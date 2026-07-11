import handler from "../../libs/handler-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { ok, badRequest, forbidden } from "../../libs/response-lib.ts";
import { isIntegral } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";
import { putTemplate } from "../../storage/formTemplates.ts";
import { FormQuestion } from "../../storage/formQuestions.ts";

export const main = handler(readYearFromPath, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const year = request.parameters.year;

  if (!isValidBody(request.body)) {
    return badRequest();
  }

  const template = {
    year: year,
    template: request.body.template as FormQuestion[],
    lastSynced: new Date().toISOString(),
  };

  await putTemplate(template);

  return ok(`Template updated for ${year}!`);
});

function readYearFromPath(evt: APIGatewayProxyEvent) {
  const yearStr = evt.pathParameters?.year;
  if (!isIntegral(yearStr)) {
    logger.warn("Invalid year in path.");
    return undefined;
  }
  return { year: Number(yearStr) };
}

type RequestBody = {
  template: unknown[];
};

function isValidBody(body: unknown): body is RequestBody {
  if (!body || "object" !== typeof body) {
    logger.warn("body is required.");
    return false;
  }

  if (!("template" in body) || !Array.isArray(body.template)) {
    logger.warn("body.template must be an array.");
    return false;
  }

  return true;
}
