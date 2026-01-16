export const FormStatus = {
  InProgress: 1,
  ProvCert: 2,
  FinalCert: 3,
  NotRequired: 4,
} as const;

export type FormStatusValue = (typeof FormStatus)[keyof typeof FormStatus];

/**
 * SEDS records timestamps as strings, with `Date.toISOString()`
 *
 * Example: `"2025-12-05T23:02:12.393Z"`
 *
 * Note some timestamps on some objects in the database drop the trailing `"Z"`
 */
export type DateString = string;

/**
 * Abridged definition of the type receieved by our lambdas in AWS.
 * We use only a handful of these properties.
 *
 * For official documentation, see https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway.html#apigateway-example-event
 *
 * For more details, see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/97a6cb3f8272fe9915c2152c964e607557906f30/types/aws-lambda/trigger/api-gateway-proxy.d.ts#L135-L148
 */
export interface APIGatewayProxyEvent {
  body: string | null;
  headers: Record<string, string | undefined>;
  pathParameters: Record<string, string | undefined> | null;
  queryStringParameters: Record<string, string | undefined> | null;
}
