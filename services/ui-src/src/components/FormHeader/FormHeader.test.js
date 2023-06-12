import React from "react";
import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import FormHeader from "./FormHeader";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import currentFormMock_GRE from "../../provider-mocks/currentFormMock_GRE";
import { storeFactory } from "../../provider-mocks/testUtils";

// The props this component requires in order to render
const defaultProps = {
  quarter: "1",
  form: "21E",
  year: "2021",
  state: "AL",
  formAnswers: [fullStoreMock.currentForm.answers],
  updateFPL: function () {},
  saveForm: function () {}
};

const mountSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return mount(
    <BrowserRouter>
      {" "}
      <FormHeader store={store} path={path} {...setupProps} />{" "}
    </BrowserRouter>
  );
};

const mockUser = {
  data: {
    email: "email@email.com",
    name: "Test User",
    states: ["CA"],
    role: "ADMIN_USER"
  }
};

jest.mock("../../libs/api", () => ({
  obtainUserByEmail: () => mockUser
}));

describe("Test FormHeader.js", () => {
  const wrapper = mountSetup(fullStoreMock);

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
  test("Hides the FPL when the form is GRE", () => {
    const GREwrapper = mountSetup(currentFormMock_GRE);
    expect(GREwrapper.find(".form-max-fpl").length).toBe(0);
  });
});
