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

    const backLink = screen.getByText("Back to User List", {
      selector: "a",
      exact: false
    });
    expect(backLink).toBeInTheDocument();

    const updateButton = screen.getByText("Update User", {
      selector: "button"
    });
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

    const table = screen.getByTestId("table");
    const rows = [...table.querySelectorAll("tr")];
    expect(rows.length).toBe(8);

    expect(rows[0].querySelector("th")).toHaveTextContent("Username");
    expect(rows[0].querySelector("td input")).toHaveValue("QWER");

    expect(rows[1].querySelector("th")).toHaveTextContent("First Name");
    expect(rows[1].querySelector("td input")).toHaveValue("Quentin");

    expect(rows[2].querySelector("th")).toHaveTextContent("Last Name");
    expect(rows[2].querySelector("td input")).toHaveValue("Werther");

    expect(rows[3].querySelector("th")).toHaveTextContent("Email");
    expect(rows[3].querySelector("td input")).toHaveValue("qwer@email.test");

    expect(rows[4].querySelector("th")).toHaveTextContent("Role");
    expect(rows[4].querySelector("td input")).toHaveValue("State User");

    expect(rows[5].querySelector("th")).toHaveTextContent("State");
    expect(rows[5].querySelector("td .is-selected")).toHaveTextContent(
      "Colorado"
    );

    expect(rows[6].querySelector("th")).toHaveTextContent("Registration Date");
    expect(rows[6].querySelector("td")).toHaveTextContent("1/15/2024");

    expect(rows[7].querySelector("th")).toHaveTextContent("Last Login");
    expect(rows[7].querySelector("td")).toHaveTextContent("2/16/2024");
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

    const roleDropdown = screen.getByPlaceholderText("Select a Role");
    userEvent.click(roleDropdown);
    const adminOption = screen.getByText("Admin User");
    userEvent.click(adminOption);

    const saveButton = screen.getByText("Update User", { selector: "button" });
    userEvent.click(saveButton);

    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "admin",
      })
    );
  });
});
