import React from "react";
import { mount } from "enzyme";
import HomeState from "./HomeState";

describe("Test HomeState.js", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(<HomeState />);
  });

  test("Check the main div exists", () => {
    expect(wrapper.find(".page-home-state").length).toBe(2);
  });

  test("Confirm number of uls ", () => {
    expect(wrapper.find("ul").length).toBe(4);
  });

  test("Confirm that first li is labeled correctly", () => {
    expect(
      wrapper.find(".quarterly-items").children().find("li").first().text()
    ).toMatch("Quarter 1");
  });

  test("Confirm that first listed date is current year", () => {
    expect(
      wrapper
        .find(".usa-accordion__heading")
        .children()
        .find("button")
        .first()
        .text()
    ).toMatch(new Date().getFullYear().toString());
  });

  test("Confirm that first accordion is open", () => {
    expect(
      wrapper
        .find(".usa-accordion__heading")
        .children()
        .find("button")
        .first()
        .prop("aria-expanded")
    ).toBe(true);
  });

  test("Confirm that second accordion is closed", () => {
    expect(
      wrapper
        .find(".usa-accordion__heading")
        .at(2)
        .children()
        .find("button")
        .prop("aria-expanded")
    ).toBe(false);
  });
});
