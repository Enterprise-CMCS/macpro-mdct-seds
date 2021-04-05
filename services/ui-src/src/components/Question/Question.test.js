import React from "react";
import { mount } from "enzyme";
import TabContainer from "../layout/TabContainer";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
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
});
