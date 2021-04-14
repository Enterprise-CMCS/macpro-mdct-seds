import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import FormFooter from "./FormFooter";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E";
import configureMockStore from "redux-mock-store";

const mockStore = configureMockStore([]);

// The props this component requires in order to render
// const defaultProps = {
//   statusData: { last_modified: "2021-04-14T12:46:35.838Z" },
//   getForm: function () {
//     return;
//   }
// };

describe("Test FormFooter.js - Mount", () => {
  let wrapper;
  let store;

  beforeEach(() => {
    // store = mockStore(currentFormMock_21E);

    store = createStore(() => {}, {
      last_modified: "2021-04-14T12:46:35.838Z"
    });

    wrapper = mount(
      <Provider store={store}>
        <FormFooter state="AL" year="2021" quarter="1" />
      </Provider>
    );
  });

  test("Check the form footer div exists", () => {
    expect(wrapper.find(".formfooter").length).toBe(1);
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
