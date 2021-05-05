import React from "react";
import { mount } from "enzyme";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter, Link } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
const mockStore = configureStore([]);

describe("Tests for HomeAdmin.js", () => {
  let wrapper;
  let store;

  const realUseState = React.useState;
  const mockInitialState = "admin";
  // Mock useState before rendering your component to set initial state values

  beforeEach(() => {
    store = mockStore(fullStoreMock);

    wrapper = mount(
      <BrowserRouter>
        <Provider store={store}>
          <HomeAdmin />
        </Provider>
      </BrowserRouter>
    );
  });

  test("Ensure HomeAdmin exists", () => {
    expect(wrapper.find(".HomeAdmin").length).toBe(1);
  });

  test("Ensure links are visible", () => {
    expect(wrapper.containsMatchingElement(<Link />));
  });
});
