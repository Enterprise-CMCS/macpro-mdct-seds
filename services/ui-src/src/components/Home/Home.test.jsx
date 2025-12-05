import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";
import { render, screen, waitFor } from "@testing-library/react";
import { useAppContext } from "../../libs/contextLib";
import { getUserInfo } from "../../utility-functions/userFunctions";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn().mockImplementation(() => { console.log("lmao what" )}),
}));

const renderComponent = (user) => {
  useAppContext.mockReturnValue({ isAuthenticated: !!user });
  getUserInfo.mockResolvedValue({ Items: [user] });
  render(
    <BrowserRouter>
      <Home user={user}/>
    </BrowserRouter>
  );
}

const adminUser = { role: "admin" };
const stateUser = { role: "state" };

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
