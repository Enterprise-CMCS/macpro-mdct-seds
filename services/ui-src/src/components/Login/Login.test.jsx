import React from "react";
import { afterAll, beforeAll, describe, expect, it, vi, vitest } from "vitest";
import Login from "./Login";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signInWithRedirect } from "aws-amplify/auth";

vi.mock("aws-amplify/auth", () => ({
  signInWithRedirect: vi.fn(),
}));

vi.mock("libs/errorLib", () => ({
  onError: vi.fn(),
}));

const currentlyOnDevelopmentBranch = () =>
  window.location.hostname !== "mdctseds.cms.gov" &&
  window.location.hostname !== "mdctsedsval.cms.gov";

describe("Test Login.js", () => {
  let originalLocation;

  beforeAll(() => {
    // window.location is hard to mock; copying https://stackoverflow.com/a/61097271
    originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      assign: vi.fn(),
    };
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  if (currentlyOnDevelopmentBranch()) {
    it("should render email login form", () => {
      render(<Login />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByText("Login", { selector: "button" })
      ).toBeInTheDocument();
    });
  }

  it("should render EUA login button", () => {
    render(<Login />);
    expect(
      screen.getByText("Login with EUA ID", { selector: "button" })
    ).toBeInTheDocument();
  });

  it("should redirect to Okta for login", async () => {
    vi.spyOn(window, "alert").mockImplementation(console.error);

    render(<Login />);

    const loginButton = screen.getByText("Login with EUA ID", {
      selector: "button",
    });
    await userEvent.click(loginButton);

    expect(signInWithRedirect).toHaveBeenCalled();
  });

  it("should display error when Okta login fails", async () => {
    signInWithRedirect.mockRejectedValue(
      new Error("Failed to fetch public IP. Error thrown from Vitest")
    );
    render(<Login />);

    const loginButton = screen.getByText("Login with EUA ID", {
      selector: "button",
    });
    await userEvent.click(loginButton);
    expect(signInWithRedirect).toHaveBeenCalled();
  });

  it("should login successfully", () => {
    render(<Login />);

    const email = screen.getByRole("textbox", { name: "Email" });
    const password = screen.getByLabelText("Password");
    const loginBtn = screen.getByRole("button", { name: "Login" });

    fireEvent.change(email, { target: { value: "mail@mail.com" } });
    fireEvent.change(password, { target: { value: "password" } });
    fireEvent.click(loginBtn);
    expect(window.location.href).toEqual(originalLocation.href);
  });
});
