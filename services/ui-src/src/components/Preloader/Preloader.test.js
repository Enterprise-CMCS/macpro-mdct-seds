import React from "react";
import { mount } from "enzyme";
import Preloader from "./Preloader";

describe("Test Preloader.js", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<Preloader />);
  });

  test("Check the main div exists", () => {
    expect(wrapper.find({ "data-testid": "profile" }).length).toBe(1);
  });

  test("Check the main content to exist", () => {
    expect(wrapper.find(".center-content").length).toBe(2);
  });

  test("Check the img tags exist", () => {
    expect(wrapper.find({ src: "preloaders/gears.gif" }).length).toBe(1);
    expect(wrapper.find({ src: "preloaders/loading_text.gif" }).length).toBe(1);
  });
});
