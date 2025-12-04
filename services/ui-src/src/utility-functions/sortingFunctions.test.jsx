import React from "react";
import { describe, expect, it } from "vitest";
import { dateFormatter } from "./sortingFunctions";

describe("dateFormatter", () => {
  it.each([
    [1704083685000, "12/31/2023 at 11:34:45 PM EST", "year end: 2023"],
    [1704087285000, "1/1/2024 at 12:34:45 AM EST", "year start: 2024"],
    [1710052485000, "3/10/2024 at 1:34:45 AM EST", "pre-DST: spring"],
    [1710056085000, "3/10/2024 at 3:34:45 AM EDT", "post-DST: spring"],
    [1725016402000, "8/30/2024 at 7:13:22 AM EDT", "☕️"],
    [1725034402000, "8/30/2024 at 12:13:22 PM EDT", "🍔"],
    [1725045202000, "8/30/2024 at 3:13:22 PM EDT", "🧑‍💻"],
    [1725063202000, "8/30/2024 at 8:13:22 PM EDT", "🍝"],
    [1730612085000, "11/3/2024 at 1:34:45 AM EDT", "pre-DST: fall"],
    [1730615685000, "11/3/2024 at 1:34:45 AM EST", "post-DST: fall"],
    [1735706085000, "12/31/2024 at 11:34:45 PM EST", "year end: 2024"],
    [1735709685000, "1/1/2025 at 12:34:45 AM EST", "year start: 2025"],
  ])(
    "should format the timestamp %d as %s (test for %s)",
    (msSinceEpoch, expectedFormat, _testCaseName) => {
      const date = new Date(msSinceEpoch).toISOString();
      const formatted = dateFormatter(date);
      expect(formatted).toBe(expectedFormat);
    }
  );
});
