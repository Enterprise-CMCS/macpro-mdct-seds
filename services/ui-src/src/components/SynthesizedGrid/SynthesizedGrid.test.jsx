import React from "react";
import { describe, expect, it } from "vitest";
import SynthesizedGrid from "./SynthesizedGrid";
import { render } from "@testing-library/react";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";
import { useStore } from "../../store/store";

const renderComponent = () => {
  useStore.setState(currentFormMock_21E.currentForm);
  return render(
    <SynthesizedGrid
      questionID="unused"
      gridData={[
        /*unused*/
      ]}
      range="0000"
    />
  );
};

describe("Test SynthesizedGrid.js", () => {
  it("should render the correct headers and data", () => {
    const { container } = renderComponent();

    const expectedColumnHeaders = [
      "", // spacer
      "% of FPL 0-133",
      "% of FPL 134-200",
      "% of FPL 201-250",
      "% of FPL 251-300",
      "% of FPL 301-317",
      "Totals",
    ];
    const columnHeaders = [...container.querySelectorAll("thead tr th")].map(
      (tr) => tr.textContent.trim()
    );
    expect(columnHeaders.length).toBe(expectedColumnHeaders.length);
    for (let i = 0; i < columnHeaders.length; i += 1) {
      expect(columnHeaders[i]).toBe(expectedColumnHeaders[i]);
    }

    const expectedRowHeaders = [
      "A. Fee-for-Service",
      "B. Managed Care Arrangements",
      "C. Primary Care Case Management",
      "Totals:",
    ];
    const rowHeaders = [
      ...container.querySelectorAll("tbody tr th:nth-child(1)"),
    ].map((tr) => tr.textContent.trim());
    expect(rowHeaders.length).toBe(expectedRowHeaders.length);
    for (let i = 0; i < rowHeaders.length; i += 1) {
      expect(rowHeaders[i]).toBe(expectedRowHeaders[i]);
    }

    // This grid has a lot of calculations in it, so we're verifying EVERYTHING
    const expectedData = [
      ["98.0", "2.0", "1.0", "114.3", "0.8", "37.7"],
      ["1.3", "1.3", "1.8", "0.5", "0.1", "0.9"],
      ["1.3", "1.0", "0.4", "0.2", "0", "0.7"],
      ["11.0", "1.2", "0.9", "24.3", "0.5", "8.7"],
    ];
    const rows = [...container.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent.trim())
    );
    expect(rows.length).toBe(expectedData.length);
    for (let i = 0; i < expectedData.length; i += 1) {
      const row = rows[i];
      const expected = expectedData[i];
      expect(row.length).toBe(expected.length);
      for (let j = 0; j < expected.length; j += 1) {
        expect(row[j]).toBe(expected[j]);
      }
    }
  });
});
