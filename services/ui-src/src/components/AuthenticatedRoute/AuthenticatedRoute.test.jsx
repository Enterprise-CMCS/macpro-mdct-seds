import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthenticatedRoute from "./AuthenticatedRoute";
import * as AppContext from "../../libs/contextLib";
import { BrowserRouter, Route } from "react-router-dom";

// Mock for useLocation
vi.mock("react-router-dom", async importOriginal => ({
  ...(await importOriginal()),
  useLocation: () => ({
    pathname: "localhost:3000/"
  })
}));

const testRoute = (
  <BrowserRouter>
    <AuthenticatedRoute>
      <h1>Hello, world!</h1>
    </AuthenticatedRoute>
  </BrowserRouter>
);

describe("AuthenticatedRoute tests", () => {
  test("Check that a route is available", () => {
    vi.spyOn(AppContext, "useAppContext").mockImplementation(() => ({
      isAuthenticated: true
    }));

    render(testRoute);

    expect(screen.getByText("Hello, world!")).toBeInTheDocument();
  });

  test("Check that unauthenticated users are redirected", () => {
    vi.spyOn(AppContext, "useAppContext").mockImplementation(() => ({
      isAuthenticated: false
    }));

    render(testRoute);

    expect(screen.queryByText("Hello, world!")).not.toBeInTheDocument();
  });
});
