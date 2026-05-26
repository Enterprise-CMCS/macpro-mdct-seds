import handler from "../../libs/handler-lib.ts";
import { canReadDataForState } from "../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import { isIntegral, isStateAbbr } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";
import { scanFormsByStateAndQuarter } from "../../storage/stateForms.ts";

export const main = handler(readStateAndQuarterFromPath, async (request) => {
  const { state, year, quarter } = request.parameters;

  if (!canReadDataForState(request.user, state)) {
    return forbidden();
  }

  return ok(await scanFormsByStateAndQuarter(state, year, quarter));
});

function readStateAndQuarterFromPath(evt: APIGatewayProxyEvent) {
  const state = evt.pathParameters?.state;
  if (!isStateAbbr(state)) {
    logger.warn("Invalid state abbreviation in path.");
    return undefined;
  }

  const yearStr = evt.pathParameters?.year;
  if (!isIntegral(yearStr)) {
    logger.warn("Invalid year in path.");
    return undefined;
  }
  const year = Number(yearStr);

  const quarterStr = evt.pathParameters?.quarter;
  if (!isIntegral(quarterStr)) {
    logger.warn("Invalid quarter in path.");
    return undefined;
  }
  const quarter = Number(quarterStr);

  return { state, year, quarter };
}
