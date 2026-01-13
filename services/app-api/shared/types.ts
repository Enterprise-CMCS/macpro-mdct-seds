export const FormStatus = {
  InProgress: 1,
  ProvCert: 2,
  FinalCert: 3,
  NotRequired: 4,
} as const;

export type FormStatusValue = typeof FormStatus[keyof typeof FormStatus];

/**
 * SEDS records timestamps as strings, with `Date.toISOString()`
 *
 * Example: `"2025-12-05T23:02:12.393Z"`
 *
 * Note some timestamps on some objects in the database drop the trailing `"Z"`
 */
export type DateString = string;
