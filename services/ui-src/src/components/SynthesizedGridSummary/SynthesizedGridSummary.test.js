import React from "react";
import { mount } from "enzyme";
import SynthesizedGridSummary from "./SynthesizedGridSummary";
import {
  mockQuestionID,
  mockLabel,
  mockAllAnswers,
  mockGridData
} from "../../provider-mocks/synthesizedGridSummaryMock";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import currentFormMock_64_21E from "../../provider-mocks/currentFormMock_64_21E.js";
const mockStore = configureStore([]);

describe("Test SynthesizedGridSummary.js", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(currentFormMock_64_21E);
    wrapper = mount(
      <Provider store={store}>
        <SynthesizedGridSummary
          allAnswers={mockAllAnswers}
          questionID={mockQuestionID}
          gridData={mockGridData}
          label={mockLabel}
        />
      </Provider>
    );
  });

  test("SynthesizedGridSummary renders grid with totals", () => {
    expect(wrapper.find(".grid-with-totals").length).toBe(1);
  });

  test("Disclaimer text should be present", () => {
    expect(
      wrapper.find(`[data-testid="synthesized-disclaimer"]`).at(0).text()
    ).toBe(" Values will not appear until source data is provided");
  });

  test("Question label loads", () => {
    expect(wrapper.find(".synthesized-summary-label").length).toBe(1);
  });

  test("Question label loads with the correct age variable for the summary tab", () => {
    expect(
      wrapper.find(`[data-testid="synthesized-summary-label"]`).at(0).text()
    ).toBe(
      "5. What is the average number of months of enrollment for children of all ages ever enrolled during the quarter?"
    );
  });

  test("Check for all top headers", () => {
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /% of FPL 0-133/
    );
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /% of FPL 134-200/
    );
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /% of FPL 201-250/
    );
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /% of FPL 251-300/
    );
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /% of FPL 301-317/
    );
  });
  // Synthesized Grid Summary should have all three row headers
  test("Check for all side headers", () => {
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /A. Fee-for-Service/
    );
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /B. Managed Care Arrangements/
    );
    expect(wrapper.find("GridWithTotals").at(0).text()).toMatch(
      /C. Primary Care Case Management/
    );
  });

  // Check the math for the synthesized grid
  test("Synthesized Summary values should be correct across the board", () => {
    expect(
      wrapper
        .find("GridWithTotals")
        .at(0)
        .find("tr")
        .at(1)
        .find("td")
        .at(0)
        .find("span")
        .text()
    ).toBe("307.9");
  });

  test("Synthesized Summary values should be correct across the board", () => {
    expect(
      wrapper
        .find("GridWithTotals")
        .at(0)
        .find("tr")
        .at(1)
        .find("td")
        .at(5)
        .text()
    ).toBe("749.8");
  });

  test("Synthesized Summary values should be correct across the board", () => {
    expect(
      wrapper
        .find("GridWithTotals")
        .at(0)
        .find("tr")
        .at(3)
        .find("td")
        .at(2)
        .find("span")
        .text()
    ).toBe("6.5");
  });
});
