import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Header from "./Header";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { signOut } from "aws-amplify/auth";

let realUseContext;
let useContextMock;

vi.mock("config/config", () => ({
  default: {
    cognito: {
      REDIRECT_SIGNOUT: "elsewhere.com"
    }
  }
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi
    .fn()
    .mockReturnValue({ tokens: { accessToken: "12345" } }),
  signOut: vi.fn()
  // signOut: vi.fn().mockImplementation(() => {
  //   return { then: () => {} };
  // })
}));

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
  beforeEach(() => {
    useContextMock.mockReturnValue(true);
    const mockUser = { attributes: { "app-role": "admin" } };
    render(
      <BrowserRouter>
        <Header user={mockUser} />
      </BrowserRouter>
    );
  });
  test("Check if Header, exists", () => {
    expect(screen.getByTestId("Header")).toBeVisible();
  });
  test("Test logout", async () => {
    signOut.mockResolvedValueOnce();
    await waitFor(() => expect(screen.getByText("My Profile")).toBeVisible());
    const logoutBtn = screen.getByRole("button", { name: "Logout" });
    userEvent.click(logoutBtn);
    expect(signOut).toHaveBeenCalled();
  });
});
