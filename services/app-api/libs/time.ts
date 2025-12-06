/**
 * Which quarter's form should we generate on the given date?
 *
 * - Jan-Mar: 1
 * - Apr-Jun: 2
 * - Jul-Sep: 3
 * - Oct-Dec: 4
 *
 * We run an automated process at the start of each quarter,
 * which generates forms for the previous quarter.
 * For example: on Jan 1 2024, we would generate forms for Oct-Dec 2023.
 * Those forms would be due for completion by Jan 31, 2024.
 *
 * A potential source of confusion is that Oct-Dec 2023 represents the
 * federal fiscal quarter 2024 Q1; a quarter ahead of what you may expect.
 * Another potential source is that we want to generate forms for the
 * _previous_ quarter, to report on data from the recent past.
 *
 * Happily, these off-by-one issues cancel each other out. So this
 * function returns the more common quarter number of the current date.
 *
 * @param date - The current date
 * @returns The Federal Fiscal Quarter for which forms should be generated
 */
export const calculateFormQuarterFromDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;

  return { year, quarter };
};

/**
 * What is the Federal Fiscal Quarter for the given date?
 *
 * - Jan-Mar: 2
 * - Apr-Jun: 3
 * - Jul-Sep: 4
 * - Oct-Dec: 1
 *
 * Federal Fiscal Quarter looks 3 months ahead of the common calendar quarter.
 */
export const calculateFiscalQuarterFromDate = (date: Date) => {
  let year = date.getFullYear();
  let quarter = Math.floor(date.getMonth() / 3) + 2;
  if (quarter === 5) {
    quarter = 1;
    year += 1;
  }
  return { year, quarter };
};
