import { describe, expect, it } from "vitest";
import { calculateFormQuarterFromDate } from "./time.js";

describe("calculateFormQuarterFromDate", () => {
  it("should calculate the correct quarter for a given date", () => {
    const date = new Date(2025, 1, 1);
    const result = calculateFormQuarterFromDate(date);
    expect(result.year).toBe(2025);
    expect(result.quarter).toBe(1);
  });
});
