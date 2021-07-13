import React from "react";
import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import FormTemplates from "./FormTemplates";
const mockStore = configureStore([]);

describe("Tests for FormTemplates.js", () => {
  let wrapper;
  let store;

  jest
    .spyOn(React, "useState")
    .mockReturnValueOnce([
      { label: "+ Create New Template", value: 0 },
      { label: 2066, value: 2066 },
      { label: 2022, value: 2022 },
      { label: 2021, value: 2021 },
      { label: 2019, value: 2019 },
      { label: 2018, value: 2018 }
    ])
    .mockReturnValueOnce({ label: 2066, value: 2066 })
    .mockReturnValueOnce(2021)
    .mockReturnValueOnce('[\n  {\n    "test": "value"\n  }\n]')
    .mockReturnValueOnce(false)
    .mockReturnValueOnce(false);

  beforeEach(() => {
    store = mockStore(fullStoreMock);

    wrapper = mount(
      <BrowserRouter>
        <Provider store={store}>
          <FormTemplates />
        </Provider>
      </BrowserRouter>
    );
  });

  test("Ensure Form Templates exists", () => {
    expect(wrapper.find(".formTemplates").length).toBe(1);
  });

  test("Ensure Form Year Select List renders", () => {
    expect(wrapper.find(".year-select-list").length).toBe(1);
  });

  // test("Ensure links are visible", () => {
  //     expect(wrapper.find({ "data-testid": "HomeAdmin" }).length).toBe(1);
  // });
});
