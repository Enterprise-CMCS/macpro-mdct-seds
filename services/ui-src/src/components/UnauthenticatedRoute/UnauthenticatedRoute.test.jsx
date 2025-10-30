import React from "react";
import { describe, expect, it, vi } from "vitest";
import UnauthenticatedRoute from "./UnauthenticatedRoute";
import { BrowserRouter, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import { render, screen } from "@testing-library/react";
import { useAppContext } from "../../libs/contextLib";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

const renderComponent = (isAuthenticated, initialRoute) => {
  useAppContext.mockReturnValue({ isAuthenticated });
  const history = createBrowserHistory();
  history.push(initialRoute);
  return render(
    <BrowserRouter>
      <UnauthenticatedRoute path="/unauth">
        <p>You need to log in</p>
      </UnauthenticatedRoute>
      <Route path="/">
        <p>Welcome home</p>
      </Route>
      <Route path="/elsewhere">
        <p>a new direction</p>
      </Route>
    </BrowserRouter>
  );
};

describe("UnauthenticatedRoute tests", () => {
  it("Should render children for unauthenticated users", () => {
    renderComponent(false, "/unauth");
    expect(screen.getByText("You need to log in")).toBeInTheDocument();
  });

  it("Should redirect authenticated users home", () => {
    renderComponent(true, "/unauth");
    expect(screen.getByText("Welcome home")).toBeInTheDocument();
  });

  it("Should redirect authenticated users elsewhere if specified", () => {
    renderComponent(true, "/unauth?redirect=/elsewhere");
    expect(screen.getByText("a new direction")).toBeInTheDocument();
  });
});
