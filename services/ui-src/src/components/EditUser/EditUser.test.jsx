import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import EditUser from "./EditUser";
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
  beforeEach(() => {
    const store = mockStore(fullStoreMock);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <EditUser />
        </BrowserRouter>
      </Provider>
    );
  });

  test("Check for User List link", () => {
    const backLink = screen.getByText(
      "Back to User List",
      { selector: "a", exact: false }
    );
    expect(backLink).toBeInTheDocument();
  });

  /* TODO, probably some tests for when we CAN find the user */

  test("Check for Cannot Find User message", () => {
    const notFoundElement = screen.getByText(
      "Cannot find user with id",
      { exact: false }
    );
    expect(notFoundElement).toBeInTheDocument();
  });
});
