import React from "react";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import Login from "./Login";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  signIn as actualSignIn,
  signInWithRedirect as actualSignInWithRedirect,
} from "aws-amplify/auth";

vi.mock("aws-amplify/auth", () => ({
  signIn: vi.fn().mockResolvedValue({ isSignedIn: true }),
  signInWithRedirect: vi.fn(),
}));
const signIn = vi.mocked(actualSignIn);
const signInWithRedirect = vi.mocked(actualSignInWithRedirect);

const mockConfig = vi.hoisted(() => ({
  cognito: {
    USER_POOL_ENDPOINT: undefined as string | undefined,
  },
}));

vi.mock("../../config/config", () => ({
  default: mockConfig,
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

  beforeEach(() => {
    mockConfig.cognito.USER_POOL_ENDPOINT = undefined;
    signIn.mockClear();
    signInWithRedirect.mockReset();
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

  it("should hide EUA login button in Floci", () => {
    mockConfig.cognito.USER_POOL_ENDPOINT = "http://localhost:4570";
    render(<Login />);

    expect(screen.getByTestId("OktaLogin")).not.toBeVisible();
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
