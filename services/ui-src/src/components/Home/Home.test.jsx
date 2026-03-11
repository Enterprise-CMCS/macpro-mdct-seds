import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";
import { render, screen } from "@testing-library/react";
import { useAppContext } from "../../libs/contextLib";
import { useStore } from "../../store/store";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn(),
}));

const renderComponent = (user) => {
  useAppContext.mockReturnValue({ isAuthenticated: !!user });
  useStore.setState({ user });
  render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

const adminUser = { role: "admin" };
const stateUser = { role: "state" };

describe("Test Home.js", () => {
  it("should render the admin view for admins", async () => {
    renderComponent(adminUser);
    expect(
      screen.getByText("Home Admin User Page", { selector: "h1" })
    ).toBeInTheDocument();
  });

  it("should render the state view for state users", async () => {
    renderComponent(stateUser);
    expect(
      screen.getByText("Welcome to SEDS!", { exact: false })
    ).toBeInTheDocument();
  });

  it("should render the unauthorized view when no user is logged in", async () => {
    renderComponent({});
    expect(
      screen.getByText("Unauthorized", { selector: "h1" })
    ).toBeInTheDocument();
  });
});
