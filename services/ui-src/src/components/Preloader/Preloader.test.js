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
});
