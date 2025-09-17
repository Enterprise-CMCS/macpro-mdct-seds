import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";
import configureStore from "redux-mock-store";
import { render, screen, waitFor } from "@testing-library/react";
import { useAppContext } from "../../libs/contextLib";
import { getUserInfo } from "../../utility-functions/userFunctions";
import fullStoreMock from "../../provider-mocks/fullStoreMock";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn().mockResolvedValue(),
}));

const mockStore = configureStore([]);

const renderComponent = (user) => {
  const store = mockStore(fullStoreMock);
  useAppContext.mockReturnValue({ isAuthenticated: !!user });
  getUserInfo.mockResolvedValue({ Items: [user] });
  render(
    <Provider store={store}>
      <BrowserRouter>
        <Home user={user}/>
      </BrowserRouter>
    </Provider>
  );
}

const adminUser = {
  attributes: { "app-role": "admin" },
};
const stateUser = {
  attributes: { "app-role": "state" },
}

describe("Test Home.js", () => {
  it("should render the admin view for admins", async () => {
    renderComponent(adminUser);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    expect(screen.getByText("Home Admin User Page", { selector: "h1" })).toBeInTheDocument();
  });

  it("should render the state view for state users", async () => {
    renderComponent(stateUser);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    expect(screen.getByText("Welcome to SEDS!", { exact: false })).toBeInTheDocument();
  });

  it("should render the unauthorized view when no user is logged in", async () => {
    renderComponent(undefined);
    expect(screen.getByText("Unauthorized", { selector: "h1" })).toBeInTheDocument();
  });
});
