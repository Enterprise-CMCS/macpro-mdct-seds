import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GridWithTotals from "./GridWithTotals";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";
import { useStore } from "../../store/store";
import { questions } from "store/helperFunctionsMockData";

const gridDataItems = [
  {
    col1: "",
    col2: "% of FPL 0-133",
    col3: "% of FPL 134-200",
    col4: "% of FPL 201-250",
    col5: "% of FPL 251-300",
    col6: "% of FPL 301-317",
  },
  {
    col1: "A. Fee-for-Service",
    col2: 1,
    col3: 2,
    col4: 3,
    col5: 4,
    col6: 5,
  },
  {
    col1: "B. Managed Care Arrangements",
    col2: 21,
    col3: 22,
    col4: 23,
    col5: 24,
    col6: 25,
  },
  {
    col1: "C. Primary Care Case Management",
    col2: 26,
    col3: 27,
    col4: 28,
    col5: 29,
    col6: 30,
  },
];

const renderComponent = (questionID = "42", questions) => {
  useStore.setState({
    ...currentFormMock_21E.currentForm,
    updateAnswer: vi.fn(),
  });
  return render(
    <GridWithTotals
      gridData={gridDataItems}
      questions={questions}
      questionID={questionID}
    />
  );
};

describe("Test GridWithTotals.js", () => {
  it("should render headers from provided grid data", () => {
    const { container } = renderComponent();

    const columnHeaders = [...container.querySelectorAll("thead th")].map(
      (th) => th.textContent
    );
    expect(columnHeaders).toEqual([
      "", // spacer
      "% of FPL 0-133",
      "% of FPL 134-200",
      "% of FPL 201-250",
      "% of FPL 251-300",
      "% of FPL 301-317",
      "Totals",
    ]);

    const rowHeaders = [...container.querySelectorAll("tbody tr th")].map(
      (th) => th.textContent
    );
    expect(rowHeaders).toEqual([
      "A. Fee-for-Service",
      "B. Managed Care Arrangements",
      "C. Primary Care Case Management",
      "Totals:",
    ]);
  });

  it("Should render input values from provided grid data", () => {
    const { container } = renderComponent();

    // We will only test the first row; the others are generated from the same code.
    const firstRowInputValues = [
      ...container.querySelectorAll("tbody tr:nth-child(1) td"),
    ].map((td) => td.querySelector("input")?.value);

    expect(firstRowInputValues).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      undefined, // Total; not an input
    ]);
  });

  it("should calculate correct totals", () => {
    const { container } = renderComponent();

    const firstRowSubtotal = container.querySelector(
      "tbody tr:nth-child(1) td.total-column"
    ).textContent;
    expect(firstRowSubtotal).toBe("15");

    const grandTotals = [
      ...container.querySelectorAll("tbody tr:nth-last-child(1) td"),
    ].map((td) => td.textContent);
    expect(grandTotals).toEqual(["48", "51", "54", "57", "60", "270"]);
  });

  it("should update totals on input", () => {
    const { container } = renderComponent();

    const input = container.querySelector("input");
    userEvent.type(input, "00");

    const rowTotal = container.querySelector("tbody tr td:nth-last-child(1)");
    expect(rowTotal).toHaveTextContent("114");

    const columnTotal = container.querySelector(
      "tbody tr:nth-last-child(1) td"
    );
    expect(columnTotal).toHaveTextContent("147");
  });
  it("should update totals for summary-synthesized", () => {
    const questions = [
      { rows: gridDataItems },
      { rows: gridDataItems },
      { rows: gridDataItems },
      { rows: gridDataItems },
    ];
    const { container } = renderComponent("summary-synthesized", questions);

    const rowTotal = container.querySelector("tbody tr td:nth-last-child(1)");
    expect(rowTotal).toHaveTextContent("1");

    const columnTotal = container.querySelector(
      "tbody tr:nth-last-child(1) td"
    );
    expect(columnTotal).toHaveTextContent("1");
  });
});
