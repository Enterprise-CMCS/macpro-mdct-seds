import React from "react";
import { shallow } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import PrintPDF from "./PrintPDF";
import { storeFactory } from "../../provider-mocks/testUtils";

// The props this component requires in order to render
const defaultProps = {
  statusData: { last_modified: "2021-01-15T12:46:35.838Z" },
  getForm: function () {
    return;
  }
};

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<PrintPDF store={store} path={path} {...setupProps} />)
    .dive()
    .dive();
};

// Mock the useParams react-router-dom function
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    state: "AL",
    year: "2021",
    quarter: "01",
    formName: "21E"
  })
}));

describe("PrintPDF component- shallow render includes classNames", () => {
  jest
    .spyOn(React, "useState")
    .mockReturnValueOnce([true, {}])
    .mockReturnValueOnce([true, {}]);

  const wrapper = shallowSetup(fullStoreMock);
  test("Should include a form-header attribute", () => {
    expect(wrapper.find(".form-header").length).toBe(1);
  });

  test("Should include a tab-container className", () => {
    expect(wrapper.find(".tab-container-main").length).toBe(1);
  });
});

describe("PrintPDF component- props", () => {
  jest
    .spyOn(React, "useState")
    .mockReturnValueOnce([true, {}])
    .mockReturnValueOnce([true, {}]);
  // creating a true shallow wrapper so that the props are accessible
  const tempStore = storeFactory(fullStoreMock);
  const wrapper = shallow(<PrintPDF store={tempStore} {...defaultProps} />);

  test("Should include a statusData prop as an object", () => {
    expect(typeof wrapper.props().children.props.statusData).toEqual("object");
  });
  test("Should include a getForm prop as a function", () => {
    expect(typeof wrapper.props().children.props.getForm).toEqual("function");
  });
});
