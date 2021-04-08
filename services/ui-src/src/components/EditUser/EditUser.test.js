import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import EditUser from "./EditUser.js";
import fullStoreMock from "../../provider-mocks/fullStoreMock";

const mockStore = configureMockStore([]);

// Mock for useParams
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    id: "5"
  })
}));

describe("Test EditUser.js", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(fullStoreMock);

    wrapper = mount(
      <Provider store={store}>
        <EditUser />
      </Provider>
    );
  });

  test("Check the main div, with classname edit-user, exists", () => {
    expect(wrapper.find(".edit-user").length).toBe(1);
  });

  test("Check for User List link", () => {
    expect(wrapper.find(".userListLink").length).toBe(2);
  });

  test("Check for Cannot Find User message", () => {
    expect(wrapper.text()).toMatch(/Cannot find user with id /);
  });
});
