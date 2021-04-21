import React from "react";
import { mount, shallow } from "enzyme";
import FormHeader from "./FormHeader";
import { BrowserRouter } from "react-router-dom";

describe("Test FormHeader.js", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <BrowserRouter>
        <FormHeader quarter="1" form="21E" state="AL" year="2021" />
      </BrowserRouter>
    );
  });

  test("Check the header div exists", () => {
    expect(wrapper.find(".form-header").length).toBe(1);
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
