import React from "react";
import { shallow } from "enzyme";

import FormTemplates from "./FormTemplates";

const reactMock = require("react");

describe("Tests for FormTemplates.js - With Complete data", () => {
  const setHookState = newState =>
    jest.fn().mockImplementation(() => [newState, () => {}]);

  reactMock.useState = setHookState({
    arrayValues: [],
    isFetching: false,
    formYears: [
      { label: "+ Create New Template", value: 0 },
      { label: 2066, value: 2066 },
      { label: 2022, value: 2022 },
      { label: 2021, value: 2021 },
      { label: 2019, value: 2019 },
      { label: 2018, value: 2018 }
    ],
    selectedYear: { label: 2066, value: 2066 },
    inputYear: 2021,
    currentTemplate: '[\n  {\n    "test": "value"\n  }\n]',
    showYearInput: false,
    alert: false
  });

  const wrapper = shallow(<FormTemplates />);

  test("Ensure Form Templates exists", () => {
    expect(wrapper.find(".formTemplates").length).toBe(1);
  });

  test("Ensure Form Year Select List renders", () => {
    expect(wrapper.find(".year-select-list").length).toBe(1);
  });

  test("Ensure links are visible", () => {
    expect(wrapper.find({ "data-testid": "formTemplates" }).length).toBe(1);
  });

  test("Ensure save button is visible", () => {
    expect(wrapper.find("#save-button").length).toBe(1);
  });
});

describe("Tests for FormTemplates.js - No Data", () => {
  const setHookState = newState =>
    jest.fn().mockImplementation(() => [newState, () => {}]);

  reactMock.useState = setHookState({
    arrayValues: [],
    isFetching: false,
    formYears: [{ label: "+ Create New Template", value: 0 }],
    selectedYear: { label: 2066, value: 2066 },
    inputYear: 2021,
    showYearInput: false,
    alert: false
  });

  const wrapper = shallow(<FormTemplates />);

  test("Ensure Form Templates exists", () => {
    expect(wrapper.find(".formTemplates").length).toBe(1);
  });

  test("Ensure Form Year Select List renders", () => {
    expect(wrapper.find(".year-select-list").length).toBe(1);
  });

  test("Ensure links are visible", () => {
    expect(wrapper.find({ "data-testid": "formTemplates" }).length).toBe(1);
  });

  test("Ensure save button is visible", () => {
    expect(wrapper.find("#save-button").length).toBe(1);
  });
});
