import React from "react";
import HomeState from "./HomeState";
import { mount } from "enzyme";

describe("Test HomeState.js", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<HomeState />);
  });

  test("Check the main element exists", () => {
    expect(wrapper.find(".page-home-state").length).toBe(1);
  });
});
