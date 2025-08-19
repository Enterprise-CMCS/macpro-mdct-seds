/**
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
 * @param { Date } date - The current date
 * @returns { Object } { year, quarter } -
 *          The Federal Fiscal Quarter for which forms should be generated
 */
export const calculateFormQuarterFromDate = (date) => {
  let year = date.getFullYear();
  let month = date.getMonth();
  let quarter = Math.floor(month / 3) + 1;

  return { year, quarter };
};
