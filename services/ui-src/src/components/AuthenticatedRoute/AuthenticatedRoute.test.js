import React from "react";
import { mount } from "enzyme";
import AuthenticatedRoute from "./AuthenticatedRoute";
import * as AppContext from "../../libs/contextLib";
import { BrowserRouter, Route } from "react-router-dom";

// Mock for useLocation
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:3000/"
  })
}));

describe("AuthenticatedRoute tests", () => {
  test("Check that a route is available", () => {
    // Set Context values
    const contextValues = { isAuthenticated: true };

    // Mock useAppContext with new values
    jest
      .spyOn(AppContext, "useAppContext")
      .mockImplementation(() => contextValues);

    const wrapper = mount(
      <BrowserRouter>
        <AuthenticatedRoute />
      </BrowserRouter>
    );

    expect(wrapper.containsMatchingElement(<Route />)).toEqual(true);
  });
});
