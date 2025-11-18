import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Header from "./Header";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

let realUseContext;
let useContextMock;

vi.mock("config/config", () => ({
  default: { cognito: {
    REDIRECT_SIGNOUT: "elsewhere.com",
  },
}}))


// *** set up mocks
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = vi.fn();
});

// *** garbage clean up (mocks)
afterEach(() => {
  React.useContext = realUseContext;
});

describe("Test Header.js", () => {
  test("Check if Header, exists", () => {
    useContextMock.mockReturnValue(true);

    const mockUser = { attributes: { "app-role": "admin" } };

    const { getByTestId } = render(
      <BrowserRouter>
        <Header user={mockUser} />
      </BrowserRouter>
    );

    expect(getByTestId("Header")).toBeVisible();
  });
});
