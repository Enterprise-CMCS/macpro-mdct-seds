import React from "react";
import { mount } from "enzyme";
import SynthesizedGridSummary from "./SynthesizedGridSummary";
import currentFormMock_64_21E from "../../provider-mocks/currentFormMock_64_21E.js";
import {
  mockQuestionID,
  mockLabel,
  mockAllAnswers,
  mockGridData
} from "../../provider-mocks/synthesizedGridSummaryMock";

describe("Test SynthesizedGridSummary.js", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(currentFormMock_64_21E);
    wrapper = mount(
      <SynthesizedGridSummary
        allAnswers={mockAllAnswers}
        questionID={mockQuestionID}
        gridData={mockGridData}
        label={mockLabel}
      />
    );
  });
  // Synthesied Grid should have all of the right FPL ranges in the header row
  test("Check for all top headers", () => {
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /% of FPL 0-133/
    );
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /% of FPL 134-200/
    );
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /% of FPL 201-250/
    );
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /% of FPL 251-300/
    );
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /% of FPL 301-317/
    );
  });
  // Synthesized Grid should have all three row headers
  test("Check for all side headers", () => {
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /A. Fee-for-Service/
    );
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /B. Managed Care Arrangements/
    );
    expect(wrapper.find("GridWithTotals").at(4).text()).toMatch(
      /C. Primary Care Case Management/
    );
  });

  // There should only be 6 grid with totals in the mock form
  test("Check number of gridwithtotal elements", () => {
    expect(wrapper.find(".grid-with-totals").length).toBe(6);
  });
});
