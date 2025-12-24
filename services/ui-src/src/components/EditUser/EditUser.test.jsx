import React from "react";
import { describe, expect, it, vi } from "vitest";
import EditUser from "./EditUser";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getUserById, updateUser } from "../../libs/api";

vi.mock("../../libs/api", () => ({
  updateUser: vi.fn().mockResolvedValue({}),
  getUserById: vi.fn()
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn().mockReturnValue({ id: "23" })
}));

const renderComponent = user => {
  if (user) {
    getUserById.mockResolvedValue({
      status: "success",
      data: user
    });
  } else {
    getUserById.mockResolvedValue({
      status: "error",
      message: "No user by specified id found"
    });
  }

  return render(
    <BrowserRouter>
      <EditUser />
    </BrowserRouter>
  );
};

const mockUser = {
  userId: 23,
  username: "QWER",
  firstName: "Quentin",
  lastName: "Werther",
  email: "qwer@email.test",
  role: "state",
  dateJoined: "2024-01-15T12:34:45Z",
  lastLogin: "2024-02-16T12:34:45Z",
  state: "CO"
};

describe("Test EditUser.js", () => {
  it("should render header and button when user is found", async () => {
    renderComponent(mockUser);
    await waitFor(() => expect(getUserById).toHaveBeenCalled());

    const backLink = screen.getByRole("link", { name: /Back to User List/ });
    expect(backLink).toBeInTheDocument();

    const updateButton = screen.getByRole("button", { name: "Update User" });
    expect(updateButton).toBeInTheDocument();
  });

  it("should render error when user is not found", async () => {
    renderComponent(undefined);
    await waitFor(() => expect(getUserById).toHaveBeenCalled());

    const errorMessage = screen.getByText("Cannot find user with id 23");
    expect(errorMessage).toBeInTheDocument();
  });

  it("should render user details in a table", async () => {
    renderComponent(mockUser);
    await waitFor(() => expect(getUserById).toHaveBeenCalled());

    expect(screen.getByRole("row", { name: "Username QWER" })).toBeVisible();
    expect(screen.getByRole("row", { name: "First Name Quentin" })).toBeVisible();
    expect(screen.getByRole("row", { name: "Last Name Werther" })).toBeVisible();
    expect(screen.getByRole("row", { name: "Email qwer@email.test" })).toBeVisible();
    expect(screen.getByRole("row", { name: "Role State User" })).toBeVisible();
    expect(screen.getByRole("row", { name: "State Colorado" })).toBeVisible();
    expect(screen.getByRole("row", { name: "Registration Date 1/15/2024" })).toBeVisible();
    expect(screen.getByRole("row", { name: "Last Login 2/16/2024" })).toBeVisible();
  });

  it("should not render admin users' state property", async () => {
    const user = {
      ...mockUser,
      role: "admin",
      state: undefined
    };
    renderComponent(user);
    await waitFor(() => expect(getUserById).toHaveBeenCalled());

    expect(screen.queryByRole("row-header", { name: "State" })).not.toBeInTheDocument();
  });

  it("should call the API to save updated user details", async () => {
    renderComponent(mockUser);
    await waitFor(() => expect(getUserById).toHaveBeenCalled());

    const roleSelect = screen.getByRole("combobox", { name: "Role" });
    userEvent.selectOptions(roleSelect, "Admin User");

    const updateButton = screen.getByRole("button", { name: "Update User" });
    userEvent.click(updateButton);

    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "admin",
      })
    );
  });
});
