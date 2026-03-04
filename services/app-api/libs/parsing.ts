import {
  APIGatewayProxyEvent,
  FormStatus,
  FormStatusValue,
  FormType,
  FormTypes,
} from "../shared/types.ts";
import { logger } from "./debug-lib.ts";

/** Does this string consist of two capital letters? */
export const isStateAbbr = (state: unknown): state is string => {
  return "string" === typeof state && /^[A-Z]{2}$/.test(state);
};

/** Does this string consist of numeric digits? */
export const isIntegral = (numStr: unknown): numStr is string => {
  return "string" === typeof numStr && /^\d+$/.test(numStr);
};

/** Is this string one of SEDS's form types? */
export const isFormType = (form: unknown): form is FormType => {
  return (
    "string" === typeof form &&
    Object.values(FormTypes).includes(form as FormType)
  );
};

/**
 * Break a `state_form` identifier into its parts.
 *
 * Returns undefined, if the identifier is not valid.
 * @example
 * parseFormId("CO-2026-1-GRE") // { state: "CO", year: 2026, quarter: 1, form: "GRE" }
 * parseFormId("invalid") // undefined
 */
export const parseFormId = (state_form: string) => {
  if (!state_form) return undefined;
  const match = /^([A-Z]{2})-(\d{4})-(\d)-(.*)$/.exec(state_form);
  if (!match) return undefined;
  const [_, state, year, quarter, form] = match;
  if (!["1", "2", "3", "4"].includes(quarter)) return undefined;
  if (!isFormType(form)) return undefined;
  return {
    state,
    year: Number(year),
    quarter: Number(quarter),
    form,
  };
};

export const isFormId = (state_form: unknown) => {
  return "string" === typeof state_form && !!parseFormId(state_form);
};

export const isStatusId = (
  status_id: unknown
): status_id is FormStatusValue => {
  return (
    "number" === typeof status_id &&
    Object.values(FormStatus).includes(status_id as FormStatusValue)
  );
};

/** Parser for API endpoints which do not read any parameters. */
export const emptyParser = (_evt: any) => ({});

export const readFormIdentifiersFromPath = (evt: APIGatewayProxyEvent) => {
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

  const form = evt.pathParameters?.form;
  if (!isFormType(form)) {
    logger.warn("Invalid form type in path.");
    return undefined;
  }

  return { state, year, quarter, form };
};
