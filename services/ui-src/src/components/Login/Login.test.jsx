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
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn, signInWithRedirect } from "aws-amplify/auth";
import users from "../../../../ui-auth/libs/users.json";

vi.mock("aws-amplify/auth", () => ({
  signIn: vi.fn(),
  signInWithRedirect: vi.fn(),
}));

const mockConfig = vi.hoisted(() => ({
  cognito: {
    OAUTH_ENABLED: true,
  },
}));

vi.mock("config/config", () => ({
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
    mockConfig.cognito.OAUTH_ENABLED = true;
    vi.clearAllMocks();
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

  it("should hide EUA login button when OAuth is disabled", () => {
    mockConfig.cognito.OAUTH_ENABLED = false;

    render(<Login />);

    expect(
      screen.queryByText("Login with EUA ID", { selector: "button" })
    ).not.toBeInTheDocument();
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

  it("should login with seeded local Cognito credentials", async () => {
    signIn.mockResolvedValue({});
    render(<Login />);

    const email = screen.getByRole("textbox", { name: "Email" });
    const password = screen.getByLabelText("Password");
    const loginBtn = screen.getByRole("button", { name: "Login" });

    fireEvent.change(email, { target: { value: users[0].username } });
    fireEvent.change(password, { target: { value: "Password123!" } });
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith({
        username: users[0].username,
        password: "Password123!",
        options: { authFlowType: "USER_PASSWORD_AUTH" },
      });
    });
    expect(window.location.href).toEqual("/");
  });
});
