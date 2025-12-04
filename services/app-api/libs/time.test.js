import { describe, expect, it } from "vitest";
import {
  calculateFiscalQuarterFromDate,
  calculateFormQuarterFromDate
} from "./time.js";

/*
 * Note that these test cases dodge exact quarter boundaries by a day or few,
 * to avoid any issues with time zones. We don't expect such issues to occur
 * in production, due to the UTC zone of the lamdbas' containers.
 *
 * For example, if your machine is in a US time zone:
 *     const date = Date("2026-01-01T04:00:00.000Z");
 *     console.log(date.getFullYear(), date.getMonth());
 *     // => 2025, 11
 * That is, even though you have specified 4am on Jan 1 2026 UTC,
 * JS will convert that to your time zone (where would still be Dec 2025)
 * and return the year and month of that locale.
 */

describe("Time functions", () => {
  describe("calculateFormQuarterFromDate", () => {
    it.each([
      { date: "2025-01-02", expectedYear: 2025, expectedQuarter: 1 },
      { date: "2025-03-28", expectedYear: 2025, expectedQuarter: 1 },
      { date: "2025-04-02", expectedYear: 2025, expectedQuarter: 2 },
      { date: "2025-06-28", expectedYear: 2025, expectedQuarter: 2 },
      { date: "2025-07-02", expectedYear: 2025, expectedQuarter: 3 },
      { date: "2025-09-28", expectedYear: 2025, expectedQuarter: 3 },
      { date: "2025-10-02", expectedYear: 2025, expectedQuarter: 4 },
      { date: "2025-12-28", expectedYear: 2025, expectedQuarter: 4 },
    ])(
      "should return $expectedYear Q$expectedQuarter given $date",
      ({ date, expectedYear, expectedQuarter }) => {
        const result = calculateFormQuarterFromDate(new Date(date));
        expect(result).toEqual({
          year: expectedYear,
          quarter: expectedQuarter
        });
      }
    );
  });
  
  describe("calculateFiscalQuarterFromDate", () => {
    it.each([
      { date: "2025-01-02", expectedYear: 2025, expectedQuarter: 2 },
      { date: "2025-03-28", expectedYear: 2025, expectedQuarter: 2 },
      { date: "2025-04-02", expectedYear: 2025, expectedQuarter: 3 },
      { date: "2025-06-28", expectedYear: 2025, expectedQuarter: 3 },
      { date: "2025-07-02", expectedYear: 2025, expectedQuarter: 4 },
      { date: "2025-09-28", expectedYear: 2025, expectedQuarter: 4 },
      { date: "2025-10-02", expectedYear: 2026, expectedQuarter: 1 },
      { date: "2025-12-28", expectedYear: 2026, expectedQuarter: 1 },
    ])(
      "should return $expectedYear Q$expectedQuarter given $date",
      ({ date, expectedYear, expectedQuarter }) => {
        const result = calculateFiscalQuarterFromDate(new Date(date));
        expect(result).toEqual({
          year: expectedYear,
          quarter: expectedQuarter
        });
      }
    );
  });
});
