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

  test("Check the main element exists", () => {
    expect(
      wrapper.find(".page-home-state").children().find("p").at(0).text()
    ).toMatch(
      "Welcome to SEDS! Please select a Federal Fiscal Year and quarter below to view available reports."
    );
  });
});
