import React from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import Login from "./Login";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("aws-amplify/auth");
vi.mock("config/config", () => ({
  default: { cognito: {
    APP_CLIENT_DOMAIN: "mock-domain",
    REDIRECT_SIGNIN: "mock-redirect",
    APP_CLIENT_ID: "mock-client-id"
  },
}}));

const currentlyOnDevelopmentBranch = () =>
  window.location.hostname !== "mdctseds.cms.gov" &&
  window.location.hostname !== "mdctsedsval.cms.gov"

describe("Test Login.js", () => {
  let originalLocation;

  beforeAll(() => {
    // window.location is hard to mock; copying https://stackoverflow.com/a/61097271
    originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      assign: vi.fn(),
    }
  });

  afterAll(() => {
    window.location = originalLocation;
  });

  if (currentlyOnDevelopmentBranch()) {
    it("should render email login form", () => {
      render(<Login/>);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByText("Login", { selector: "button"})).toBeInTheDocument();
    });
  }

  it("should render EUA login button", () => {
    render(<Login/>);
    expect(screen.getByText("Login with EUA ID", { selector: "button"})).toBeInTheDocument();
  });

  it("should redirect to Okta for login", async () => {
    vi.spyOn(window, "alert").mockImplementation(console.error);

    render(<Login/>);

    const loginButton = screen.getByText("Login with EUA ID", { selector: "button"});
    await userEvent.click(loginButton);

    const oktaUrl = "https://mock-domain/oauth2/authorize?identity_provider=Okta&redirect_uri=mock-redirect&response_type=token&client_id=mock-client-id";
    expect(window.location.assign).toHaveBeenCalledWith(oktaUrl);
  });
});
