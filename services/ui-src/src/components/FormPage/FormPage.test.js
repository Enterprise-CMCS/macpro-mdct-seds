import React from "react";
import { shallow } from "enzyme";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import FormPage from "./FormPage";
import { storeFactory } from "../../provider-mocks/testUtils";
import FormHeader from "../FormHeader/FormHeader";
import FormFooter from "../FormFooter/FormFooter";

// The props this component requires in order to render
const defaultProps = {
  statusData: { last_modified: "01-15-2021" },
  getForm: function () {
    return;
  }
};

const shallowSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return shallow(<FormPage store={store} path={path} {...setupProps} />)
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

describe("FormPage component- shallow render includes classNames", () => {
  const wrapper = shallowSetup(fullStoreMock);
  test("Should include a form-header className", () => {
    expect(wrapper.find(".form-header-main").length).toBe(1);
  });

  test("Should include a tab-container className", () => {
    expect(wrapper.find(".tab-container").length).toBe(1);
  });

  test("Should include a form-footer className", () => {
    expect(wrapper.find(".form-footer").length).toBe(1);
  });
});

describe("FormPage component- props", () => {
  const tempStore = storeFactory(fullStoreMock);
  const wrapper = shallow(<FormPage store={tempStore} {...defaultProps} />);

  describe("FormPage component- accurate incoming props", () => {
    // creating a true shallow wrapper so that the props are accessible

    test("Should include a statusData prop as an object", () => {
      expect(typeof wrapper.props().children.props.statusData).toEqual(
        "object"
      );
    });
    test("Should include a getForm prop as a function", () => {
      expect(typeof wrapper.props().children.props.getForm).toEqual("function");
    });
  });
});

describe("FormPage component- Child Components", () => {
  let state = "AL";
  let year = "2021";
  let quarter = "1";
  let formName = "21E";
  let last_modified = "01-15-2021";

  const wrapper = shallowSetup(fullStoreMock);

  test("Should include a FormHeader component", () => {
    expect(
      wrapper.containsMatchingElement(
        <FormHeader
          quarter={quarter}
          form={formName}
          year={year}
          state={state}
        />
      )
    ).toEqual(true);
  });
  test("Should include a FormFooter component", () => {
    expect(
      wrapper.containsMatchingElement(
        <FormFooter
          state={state}
          year={year}
          quarter={quarter}
          lastModified={last_modified}
        />
      )
    ).toEqual(true);
  });
  test("Should include a (connected) TabContainer component", () => {
    expect(wrapper.find("Connect(TabContainer)")).toHaveLength(1);
  });
});

// jest.mock("react-router-dom", () => ({
//     ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
//     useParams: () => ({
//       state: "AL",
//       year: "2021",
//       quarter: "01",
//       formName: "21E"
//     })
//   }));
// const defaultProps = {
//   statusData: { last_modified: "01-15-2021" },
//   getForm: function () {
//     return;
//   }
// };

// component.debug() will show you what its getting

// TESTS TODO:
// setup store factory
// look at test suite setup
// look at test helper functions

// CAN DO:
// check proptypes (n props = n tests)
// check that statusData is present and is an object
// check that getForm is present and is a function
// check that form-header classname is present
// check that form-footer classname is present
// check that tab-container classname is present

// UNSURE:
// mount it and check that footer and header children classnames are present
// mount it and check if variables are set ??
// trigger getForm and confirm that the store is changed
