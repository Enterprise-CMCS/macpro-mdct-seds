import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import SummaryNotes from "./SummaryNotes";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";

const mockStore = configureStore([]);

const mockUser = {
  Items: [
    {
      status: "success",
      email: "email@email.com",
      name: "Test User",
      states: ["CA"],
      role: "state"
    }
  ]
};
jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: () => Promise.resolve(mockUser)
}));
jest.mock("../../libs/api", () => ({
  obtainUserByEmail: () => mockUser
}));
describe("Test SummaryNotes.js", () => {
  let store;
  let wrapper;
  // Cache original functionality
  const realUseState = React.useState;
  // Stub the initial state
  const mockInitialState =
    currentFormMock_21E.currentForm.statusData.state_comments[0].entry;
  // Mock useState before rendering your component to set initial state values
  jest
    .spyOn(React, "useState")
    .mockImplementationOnce(() => realUseState(mockInitialState));
  beforeEach(() => {
    store = mockStore(currentFormMock_21E);
    wrapper = mount(
      <Provider store={store}>
        <SummaryNotes />
      </Provider>
    );
  });

  test("Check for Summary Notes label and input", () => {
    expect(wrapper.find("label").at(0).text()).toMatch(
      /Add any notes here to accompany the form submission/
    );
    expect(wrapper.find("#summaryNotesInput").at(1).exists()).toBe(true);
  });

  test("Check that the Summary notes contain the correct values", () => {
    expect(wrapper.find("#summaryNotesInput").at(1).text()).toMatch(
      "This is an example of summary notes on the state form 21E for AL"
    );
  });
});
