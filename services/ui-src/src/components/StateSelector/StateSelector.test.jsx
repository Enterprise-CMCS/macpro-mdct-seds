import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter, useHistory } from "react-router-dom";
import StateSelector from "./StateSelector";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { updateUser } from "../../libs/api";
import { useStore } from "../../store/store";

vi.mock("../../libs/api", () => ({
  updateUser: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useHistory: vi.fn(),
}));

const renderComponent = (user) => {
  useStore.setState({
    user,
    loadUser: vi.fn(),
  });
  return render(
    <BrowserRouter>
      <StateSelector />
    </BrowserRouter>
  );
};

describe("StateSelector component", () => {
  it("should render an alert for users with a state", async () => {
    renderComponent({ state: "CO" });

    expect(
      screen.getByText(
        "This account has already been associated with a state: CO"
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText("This account is not associated with any states")
    ).not.toBeInTheDocument();
    const stateDropdown = screen.queryByRole("combobox", { name: /state/ });
    expect(stateDropdown).not.toBeInTheDocument();
    const updateButton = screen.queryByRole("button", { name: "Update User" });
    expect(updateButton).not.toBeInTheDocument();
  });

  it("should render a selector for users with no state", async () => {
    renderComponent({ state: undefined });

    expect(
      screen.queryByText(
        "This account has already been associated with a state",
        { exact: false }
      )
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("This account is not associated with any states")
    ).toBeInTheDocument();
    const stateDropdown = screen.getByRole("combobox", { name: /state/ });
    expect(stateDropdown).toBeVisible();
    const updateButton = screen.getByRole("button", { name: "Update User" });
    expect(updateButton).toBeVisible();
  });

  it("should tell non-state users that they do not need to be here", () => {
    renderComponent({ role: "admin" });

    const message = "Admin users have access to all states' form data.";
    expect(screen.getByText(message)).toBeVisible();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("should save the user's selected state, reload their data in the store, and redirect them to Home", async () => {
    vi.spyOn(window, "confirm").mockImplementation(() => true);
    const mockHistory = { push: vi.fn() };
    useHistory.mockReturnValue(mockHistory);

    renderComponent({ id: 42, state: undefined });

    const stateDropdown = screen.getByRole("combobox", { name: /state/ });
    userEvent.selectOptions(stateDropdown, "Colorado");

    userEvent.click(screen.getByRole("button", { name: "Update User" }));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({ id: 42, state: "CO" });
      expect(useStore.getState().loadUser).toHaveBeenCalled();
    });
    expect(mockHistory.push).toHaveBeenCalledWith("/");
  });
});
