import { canReadDataForState } from "../../auth/authConditions.ts";
import handler from "../../libs/handler-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import { isStateAbbr } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";
import { scanFormsByState } from "../../storage/stateForms.ts";

/**
 * Returns list of all forms based on state
 * This can be used for displaying a list of years and quarters available
 */
export const main = handler(readStateIdFromPath, async (request) => {
  const { state } = request.parameters;

  if (!canReadDataForState(request.user, state)) {
    return forbidden();
  }

  const forms = await scanFormsByState(state);
  if (forms.length === 0) {
    throw new Error("No state form list found for this state");
  }

  return ok(forms);
});

function readStateIdFromPath(evt: APIGatewayProxyEvent) {
  const state = evt.pathParameters?.state;
  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path.");
    return undefined;
  }
  return { state };
}
