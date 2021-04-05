import React from "react";
import {mount, shallow} from "enzyme";
import FormFooter from "./FormFooter";

describe("Test FormFooter.js - Shallow", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
        <FormFooter state="AL" year="2021" quarter="1" lastModified="01-15-2021"/>
    );
  });

  test("Check the form footer div exists", () => {
    expect(wrapper.find(".formfooter").length).toBe(1);
  });
});

describe("Test FormFooter.js - Mount", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
        <FormFooter state="AL" year="2021" quarter="1" lastModified="01-15-2021" />
    );
  });

  test("Check for Link back to Quarter Page list of available reports", () => {
    // Using Link from TrussWorks results in the component AND link sharing the same class name...
    // This would be 3 otherwise
    expect(wrapper.find(".form-nav").length).toBe(2);
  });

  test("Check for Last Saved Date display", () => {
    expect(wrapper.find(".form-actions").length).toBe(2);
  });

  test("Check for Save button", () => {
    expect(wrapper.find(".hollow").length).toBe(2);
  });
});
