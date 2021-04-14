import React from "react";
import { shallow, mount } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";
import { BrowserRouter } from "react-router-dom";

// The props this component requires in order to render
const defaultProps = {
  not_applicable: false,
  status: "In Progress",
  toggle: function () {},
  resetData: function () {}
};

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<NotApplicable store={store} path={path} {...setupProps} />)
    .dive()
    .dive();
};
const mountSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return mount(
    <BrowserRouter>
      {" "}
      <NotApplicable store={store} path={path} {...setupProps} />{" "}
    </BrowserRouter>
  );
};

describe("NotApplicable component- includes data attributes", () => {
  const wrapper = shallowSetup(fullStoreMock);

  test("Should include data attribute: applicable-wrapper", () => {
    expect(wrapper.find(`[data-test="applicable-wrapper"]`).length).toBe(1);
  });

  test("Should include data attribute: applicable-prompt", () => {
    expect(wrapper.find(`[data-test="applicable-prompt"]`).length).toBe(1);
  });

  test("Should include data attribute: applicable-slider", () => {
    expect(wrapper.find(`[data-test="applicable-slider"]`).length).toBe(1);
  });
  test("Should include data attribute: slider-input", () => {
    expect(wrapper.find(`[data-test="slider-input"]`).length).toBe(1);
  });
});

// const shallowSetup = (initialState = {}, props = {}, path = "") => {
//   const setupProps = { ...defaultProps, ...props };
//   const store = storeFactory(initialState);
//   return shallow(<NotApplicable store={store} path={path} {...setupProps} />)
//     .dive()
//     .dive();
// };

describe("NotApplicable component- disabled functionality", () => {
  // let wrapper;

  // beforeEach(() => {
  //   wrapper = "";
  // });
  // test("Status should change when button clicked", () => {
  //   // expect(wrapper.find(".form-header-main").length).toBe(1);
  // });

  describe("NotApplicable component- disabled functionality(In Progress)", () => {
    const inProgressProps = {
      status: "In Progress"
    };
    let wrapper = mountSetup(fullStoreMock, inProgressProps);
    test("Status should change based on incoming props- In progress", () => {
      expect(wrapper.find(".is-selected").length).toBe(1);
    });
    test("Status should change based on incoming props- In progress", () => {
      expect(wrapper.find(".applicable-selected").length).toBe(1);
    });
    test("Status should change based on incoming props- In progress", () => {
      expect(wrapper.find(".not-applicable-selected").length).toBe(0);
    });
  });

  describe("NotApplicable component- disabled functionality(Final)", () => {
    const finalProps = {
      not_applicable: true
    };
    let wrapper = mountSetup(fullStoreMock, finalProps);
    test("Status should change based on incoming props- In progress", () => {
      expect(wrapper.find(".is-selected").length).toBe(1);
    });
    test("Status should change based on incoming props- In progress", () => {
      expect(wrapper.find(".applicable-selected").length).toBe(0);
    });
    test("Status should change based on incoming props- In progress", () => {
      expect(wrapper.find(".not-applicable-selected").length).toBe(1);
    });
  });
  // test("Status should change based on incoming props- status", () => {
  //   const isFinalProps = {
  //     not_applicable: false,
  //     status: "Final Data Certified and Submitted",
  //     toggle: function () {},
  //     resetData: function () {}
  //   };
  //   wrapper = shallowSetup(fullStoreMock);
  //   expect(wrapper.find(".is-selected").length).toBe(1);
  //   // expect(wrapper.find(`[data-test="applicable-slider"]`).length).toBe(1);
  // });

  // test("Status should change based on incoming props- status", () => {
  //   const notRequiredProps = {
  //     not_applicable: false,
  //     status: "Not Required",
  //     toggle: function () {},
  //     resetData: function () {}
  //   };
  //   wrapper = shallowSetup(fullStoreMock);
  //   // expect(wrapper.find(".tab-container").length).toBe(1);
  // });
});
