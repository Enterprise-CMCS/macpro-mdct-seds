import React from "react";
import App from "./App";
import { shallow } from "enzyme";

// mocking config file because the redirect affects this test setup
jest.mock("../../config/config", () => {
  return {};
});

describe("Test App.js", () => {
  test("Check the main div, with classname app, exists", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(".App").length).toBe(1);
  });
});
