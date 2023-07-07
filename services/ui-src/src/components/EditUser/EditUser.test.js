import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import EditUser from "./EditUser.js";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { BrowserRouter } from "react-router-dom";

const mockStore = configureMockStore([]);

const mockUser = {
  data: {
    email: "email@email.com",
    name: "Test User",
    states: ["CA"],
    role: "ADMIN_USER"
  }
};

jest.mock("../../libs/api", () => ({
  obtainUserByEmail: () => mockUser,
  getUserById: () => Promise.resolve(mockUser)
}));

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
        <BrowserRouter>
          <EditUser />
        </BrowserRouter>
      </Provider>
    );
  });

  test("Check the main div, with classname edit-user, exists", () => {
    expect(wrapper.find(".edit-user").length).toBe(1);
  });

  test("Check for User List link", () => {
    expect(wrapper.find(".userListLink").length).toBe(3);
  });

  test("Check for Cannot Find User message", () => {
    expect(wrapper.text()).toMatch(/Cannot find user with id /);
  });
});
