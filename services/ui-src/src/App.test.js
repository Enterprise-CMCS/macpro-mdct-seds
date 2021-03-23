import React from "react";
import App from "./App";
import { shallow } from "enzyme";

describe("App.js", () => {
  test("Check the main div, with classname app, exists", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(".App").length).toBe(1);
  });
});
