import React from "react";
import { mount, shallow } from "enzyme";
import FormHeader from "./FormHeader";

describe("Test FormHeader.js - Shallow", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <FormHeader quarter="1" form="21E" state="AL" year="2021" />
    );
  });

  test("Check the header div exists", () => {
    expect(wrapper.find(".form-header").length).toBe(1);
  });

  test("Check for max FPL div", () => {
    expect(wrapper.find(".form-max-fpl").length).toBe(1);
  });
});

describe("Test FormHeader.js - Mount", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <FormHeader quarter="1" form="21E" state="AL" year="2021" />
    );
  });

  test("Check for upper form links", () => {
    // Using Link from TrussWorks results in the component AND link sharing the same class name...
    // This would be 3 otherwise
    expect(wrapper.find(".upper-form-links").length).toBe(6);
  });

  test("Check for correct state", () => {
    // Using Link from TrussWorks results in the component AND link sharing the same class name...
    // This would be 3 otherwise
    expect(wrapper.find(".state-value").text()).toBe("AL");
  });

  test("Check for correct quarter/year", () => {
    // Using Link from TrussWorks results in the component AND link sharing the same class name...
    // This would be 3 otherwise
    expect(wrapper.find(".quarter-value").text()).toBe("1/2021");
  });
});
