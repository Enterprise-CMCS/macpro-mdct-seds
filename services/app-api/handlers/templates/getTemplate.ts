import handler from "../../libs/handler-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { ok, notFound, forbidden } from "../../libs/response-lib.ts";
import { isIntegral } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";
import { getTemplate } from "../../storage/formTemplates.ts";

export const main = handler(readYearFromPath, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  const year = request.parameters.year;
  const template = await getTemplate(year);

  if (!template) {
    return notFound(`Could not find form template for year: ${year}`);
  }

  return ok(template);
});

function readYearFromPath(evt: APIGatewayProxyEvent) {
  const yearStr = evt.pathParameters?.year;
  if (!isIntegral(yearStr)) {
    logger.warn("Invalid year in path.");
    return undefined;
  }
  return { year: Number(yearStr) };
}
