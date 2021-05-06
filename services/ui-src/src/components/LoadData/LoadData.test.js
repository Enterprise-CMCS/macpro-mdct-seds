import React from "react";
import LoadData from "./LoadData";
import { mount } from "enzyme";

let wrapper;

// *** set up mocks
beforeEach(() => {
  wrapper = mount(<LoadData />);
});

// *** garbage clean up (mocks)
afterEach(() => {});

describe("testing LoadData component", () => {
  test("Check the main element renders correctly", () => {
    expect(wrapper.find(".load-data-wrapper").length).toBe(1);
  });
});
