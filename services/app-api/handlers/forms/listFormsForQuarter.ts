import handler from "../../libs/handler-lib.ts";
import dynamoDb from "../../libs/dynamodb-lib.ts";
import { canReadDataForState } from "../../auth/authConditions.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { forbidden, ok } from "../../libs/response-lib.ts";
import { isIntegral, isStateAbbr } from "../../libs/parsing.ts";
import { logger } from "../../libs/debug-lib.ts";

export const main = handler(readStateAndQuarterFromPath, async (request) => {
  const { state, year, quarter } = request.parameters;

  if (!canReadDataForState(request.user, state)) {
    return forbidden();
  }

  const params = {
    TableName: process.env.StateFormsTable,
    FilterExpression:
      "state_id = :state and quarter = :quarter and #year = :year",
    ExpressionAttributeNames: { "#year": "year" },
    ExpressionAttributeValues: {
      ":state": state,
      ":year": year,
      ":quarter": quarter,
    },
  };

  const result = await dynamoDb.scan(params);
  return ok(result.Items);
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
