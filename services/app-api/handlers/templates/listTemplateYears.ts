import handler from "../../libs/handler-lib.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import { emptyParser } from "../../libs/parsing.ts";
import { scanTemplateYears } from "../../storage/formTemplates.ts";

export const main = handler(emptyParser, async (request) => {
  if (request.user.role !== "admin") {
    return forbidden();
  }

  return ok(await scanTemplateYears());
});
