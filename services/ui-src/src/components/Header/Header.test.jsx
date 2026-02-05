import React from "react";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
import Header from "./Header";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
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
    useStore.setState({ wipeUser: vi.fn() });
    signOut.mockResolvedValueOnce();

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    await waitFor(() => expect(fetchAuthSession).toHaveBeenCalled());

    userEvent.click(screen.getByRole("button", { name: "My Profile" }));
    const logoutButton = screen.getByRole("button", { name: "Logout" });
    userEvent.click(logoutButton);

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(useStore.getState().wipeUser).toHaveBeenCalled();
  });

  it("should not clear user data from the store if Amplify logout fails", async () => {
    useStore.setState({ wipeUser: vi.fn() });
    signOut.mockRejectedValueOnce(new Error("Mock Amplify error"));

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    await waitFor(() => expect(fetchAuthSession).toHaveBeenCalled());

    userEvent.click(screen.getByRole("button", { name: "My Profile" }));
    const logoutButton = screen.getByRole("button", { name: "Logout" });
    userEvent.click(logoutButton);

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(useStore.getState().wipeUser).not.toHaveBeenCalled();
  });
  test("Test logout", async () => {
    signOut.mockResolvedValueOnce();
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText("My Profile")).toBeVisible());
    userEvent.click(screen.getByRole("button", { name: "My Profile" }));
    const logoutBtn = screen.getByRole("button", { name: "Logout" });
    userEvent.click(logoutBtn);
    expect(signOut).toHaveBeenCalled();
  });
});
