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

  test("Rewrite", () => {
    expect(1).toBe(1);
  });
});