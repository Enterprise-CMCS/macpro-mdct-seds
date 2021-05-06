import React from "react";
import { mount } from "enzyme";
import Profile from "./Profile";

describe("Test SummaryTab.js", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<Profile />);
  });

  test("Check the main div exists", () => {
    expect(wrapper.find(".Profile").length).toBe(1);
  });

  test("Check for all fields exists", () => {
    expect(wrapper.find("#email").length).toBe(1);
    expect(wrapper.find("#firstName").length).toBe(1);
    expect(wrapper.find("#lastName").length).toBe(1);
    expect(wrapper.find("#role").length).toBe(1);
    expect(wrapper.find("#states").length).toBe(1);
  });
});
