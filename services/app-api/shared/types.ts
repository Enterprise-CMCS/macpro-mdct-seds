import { HttpResponse } from "../libs/response-lib.ts";
import { AuthUser } from "../storage/users.ts";

export const FormStatus = {
  InProgress: 1,
  ProvCert: 2,
  FinalCert: 3,
  NotRequired: 4,
} as const;
export type FormStatusValue = (typeof FormStatus)[keyof typeof FormStatus];

export const FormTypes = {
  "21E": "21E",
  "64.EC": "64.EC",
  "64.21E": "64.21E",
  "64.ECI": "64.ECI",
  GRE: "GRE",
  "21PW": "21PW",
} as const;
export type FormType = (typeof FormTypes)[keyof typeof FormTypes];

/**
 * SEDS records timestamps as strings, with `Date.toISOString()`
 *
 * Example: `"2025-12-05T23:02:12.393Z"`
 *
 * Note some timestamps on some objects in the database drop the trailing `"Z"`
 */
export type DateString = string;

/**
 * All the user information contained in a Cognito token.
 *
 * This does _not_ contain the user's state, and the role is a best guess.
 * For the state and a definitive role, refer to the AuthUser dynamo table.
 */
export type CmsUser = {
  email: string | undefined;
  firstName: string | undefined;
  lastName: string | undefined;
  role: string;
  username: string | undefined;
  usernameSub: string;
};

/**
 * Abridged definition of the type receieved by our lambdas in AWS.
 * We use only a handful of the available properties.
 *
 * For official documentation, see https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html#apigateway-example-event
 *
 * For more details, see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/97a6cb3f8272fe9915c2152c964e607557906f30/types/aws-lambda/trigger/api-gateway-proxy.d.ts#L135-L148
 */
export interface APIGatewayProxyEvent {
  body: string | null;
  path: string;
  headers: Record<string, string | undefined>;
  pathParameters: Record<string, string | undefined> | null;
  queryStringParameters: Record<string, string | undefined> | null;
}

/**
 * Given an event, pull out all necessary parameters.
 * Returns undefined if parsing fails (due to a missing or invalid param).
 *
 * Usually, these extract reportType and state from the event's pathParameters,
 * but exact needs will vary from endpoint to endpoint.
 *
 * If parsing fails, parsers should log which parameter was missing or invalid.
 */
export type ParameterParser<TParams> = (
  event: APIGatewayProxyEvent
) => TParams | undefined;

/**
 * Represents a request that:
 *   1. Has valid values for all necessary parameters
 *   2. Has a sanitized body (or none at all)
 *   3. Has user data parsed from the auth token, and/or looked up from the DB.
 *
 * This is a more refined object than `APIGatewayProxyEvent`.
 */
export interface AuthenticatedRequest<TParams = void> {
  body: object | undefined;
  /**
   * For most endpoints, this will be the record found in the AuthUser table,
   * which is the source of truth for user role and user state.
   *
   * For `getCurrentUser`, this will be data derived from the Cognito token.
   * For _that endpoint only_, this type is inaccurate; it should be `CmsUser`.
   */
  user: AuthUser;
  parameters: TParams;
}

/**
 * Performs all the necessary operations for an API endpoint. This includes:
 *   1. Checking user permissions
 *   2. Validating the request body (if applicable)
 *   3. Creating, reading, updating, and/or deleting appropriate resources
 *   4. Returning an HTTP Response (complete with status and headers)
 */
export type HandlerLambda<TParams> = (
  request: AuthenticatedRequest<TParams>
) => Promise<HttpResponse>;
