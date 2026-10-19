import React from "react";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
import Header from "./Header";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router";
import { fetchAuthSession, signOut as actualSignOut } from "aws-amplify/auth";
import { useStore } from "../../store/store";

vi.mock("config/config", () => ({
  default: {
    cognito: {
      REDIRECT_SIGNOUT: "elsewhere.com",
    },
  },
}));

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn().mockResolvedValue({ tokens: "mock tokens" }),
  signOut: vi.fn(),
}));
const signOut = vi.mocked(actualSignOut);

describe("Test Header.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Check if Header, exists", () => {
    const { getByTestId } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(getByTestId("Header")).toBeVisible();
  });

  it("should log the user out properly", async () => {
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "Any string here prevents JSDOM complaints in the test output.",
    });
    useStore.setState({ wipeUser: vi.fn() });
    signOut.mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    await waitFor(() => expect(fetchAuthSession).toHaveBeenCalled());

    const myProfileBtn = screen.getByRole("button", { name: "My Profile" });
    userEvent.click(myProfileBtn);

    const logoutButton = screen.getByRole("button", { name: "Logout" });
    userEvent.click(logoutButton);

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(useStore.getState().wipeUser).toHaveBeenCalled();
    locationSpy.mockRestore();
  });

  it("should not clear user data from the store if Amplify logout fails", async () => {
    useStore.setState({ wipeUser: vi.fn() });
    signOut.mockRejectedValueOnce(new Error("Mock Amplify error"));

    // Swallow this error (but only this error)
    const spy = vi.spyOn(console, "log").mockImplementation((...args) => {
      const [message, arg] = args;
      if (
        message !== "error signing out:" ||
        !(arg instanceof Error) ||
        arg.message !== "Mock Amplify error"
      ) {
        throw new Error(arg);
      }
    });

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    await waitFor(() => expect(fetchAuthSession).toHaveBeenCalled());

    const myProfileBtn = screen.getByRole("button", { name: "My Profile" });
    userEvent.click(myProfileBtn);

    const logoutButton = screen.getByRole("button", { name: "Logout" });
    userEvent.click(logoutButton);

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    spy.mockRestore();
    expect(useStore.getState().wipeUser).not.toHaveBeenCalled();
  });

  test("Should opens Reporting Instruction file in a new tab", async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText("My Profile")).toBeVisible());
    const myProfileBtn = screen.getByRole("button", { name: "My Profile" });
    userEvent.click(myProfileBtn);

    await waitFor(() =>
      expect(screen.getByText("Reporting Instructions")).toBeVisible()
    );
    const reportingInstructionLink = screen.getByText("Reporting Instructions");
    expect(reportingInstructionLink).toBeVisible();
    expect(reportingInstructionLink).toHaveAttribute(
      "href",
      `${window.location.origin}/SEDS_instructions_July_2021.pdf`
    );
    expect(reportingInstructionLink).toHaveAttribute("target", "_blank");
  });
});
