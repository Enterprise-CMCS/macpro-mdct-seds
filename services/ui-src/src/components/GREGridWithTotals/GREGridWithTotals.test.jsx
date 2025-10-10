import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import GREGridWithTotals from "./GREGridWithTotals";
import currentFormMock_GRE from "../../provider-mocks/currentFormMock_GRE.js";

const gridDataItems = [
  {
    col1: "",
    col2: "21E Enrolled",
    col3: "64.21E Enrolled",
    col4: "Total CHIP Enrolled",
    col5: "64.EC Enrolled",
    col6: "21PW Enrolled"
  },
  {
    col1: "1. Female",
    col2: 10,
    col3: 15,
    col4: null,
    col5: 20,
    col6: 25
  },
  {
    col1: "2. Male",
    col2: 30,
    col3: 35,
    col4: null,
    col5: 40,
    col6: 45
  },
  {
    col1: "3. Unspecified Gender",
    col2: 50,
    col3: 55,
    col4: null,
    col5: 60,
    col6: 65
  }
];

const mockStore = configureStore([]);
const renderComponent = () => {
  const store = mockStore(currentFormMock_GRE);
  return render(
    <Provider store={store}>
      <GREGridWithTotals
        gridData={gridDataItems}
        questionID="42"
        disabled={false}
      />
    </Provider>
  );
};

describe("Test GREGridWithTotals.js", () => {
  it("should render headers from provided grid data", () => {
    const { container } = renderComponent();

    const columnHeaders = [...container.querySelectorAll("thead th")]
      .map(th => th.textContent);
    expect(columnHeaders).toEqual([
      "", // spacer
      "21E Enrolled",
      "64.21E Enrolled",
      "Total CHIP Enrolled",
      "64.EC Enrolled",
      "21PW Enrolled",
      "Totals"
    ]);

    const rowHeaders = [...container.querySelectorAll("tbody tr th")]
      .map(th => th.textContent);
    expect(rowHeaders).toEqual([
      "1. Female",
      "2. Male",
      "3. Unspecified Gender",
      "Totals:"
    ]);
  });

  it("Should render input values from provided grid data", () => {
    const { container } = renderComponent();

    // We will only test the first row; the others are generated from the same code.
    const firstRowInputValues = [...container.querySelectorAll("tbody tr:nth-child(1) td")]
      .map(td => td.querySelector("input")?.value);

    expect(firstRowInputValues).toEqual([
      "10",
      "15",
      undefined, // Total CHIP; not an input
      "20",
      "25",
      undefined, // Total; not an input
    ]);
  });

  it("should calculate correct totals", () => {
    const { container } = renderComponent();

    const firstRowSubtotals = [...container.querySelectorAll("tbody tr:nth-child(1) td.total-column")]
      .map(td => td.textContent);
    expect(firstRowSubtotals).toEqual(["25", "70"]);

    const grandTotals = [...container.querySelectorAll("tbody tr:nth-last-child(1) td")]
      .map(td => td.textContent);
    expect(grandTotals).toEqual([
      "90",
      "105",
      "195",
      "120",
      "135",
      "450",
    ]);
  });
});
