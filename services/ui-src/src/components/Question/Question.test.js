import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import TabContainer from "../TabContainer/TabContainer.js";
import currentFormMock_64_21E from "../../providerMocks/currentFormMock_64_21E.js";

const mockStore = configureStore([]);

describe("Test Question.js", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(currentFormMock_64_21E);
    wrapper = mount(
      <Provider store={store}>
        <TabContainer />
      </Provider>
    );
  });

  test("Check for all question numbers and the beginning of the question", () => {
    expect(wrapper.text()).toMatch(/1. What is the/);
    expect(wrapper.text()).toMatch(/2. What is the/);
    expect(wrapper.text()).toMatch(/3. What is the/);
    expect(wrapper.text()).toMatch(/4. What is the/);
    expect(wrapper.text()).toMatch(/5. What is the/);
    expect(wrapper.text()).toMatch(/6. What is the/);
  });

  test("Check for correct age range", () => {
    expect(wrapper.text()).toMatch(/Under Age 0/);
  });
  test("Check number of gridwithtotal elements", () => {
    expect(wrapper.find(".grid-with-totals").length).toBe(6);
  });
});
