import React from "react";
import Profile from "./Profile";
import { render, screen, waitFor } from "@testing-library/react";
import { getUserInfo } from "../../utility-functions/userFunctions";

jest.spyOn(window, "alert").mockImplementation();

jest.mock("react-router-dom", () => ({
  useHistory: jest.fn().mockReturnValue({
    push: jest.fn(),
  })
}));

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn().mockResolvedValue({
    Items: [
      {
        email: "ben@example.com",
        firstName: "ben",
        lastName: "martin",
        role: "state",
        states: ["CO"],
      },
    ],
  }),
}));

const renderComponent = () => {
  return render(<Profile/>);
}

describe("Test SummaryTab.js", () => {
  it("should render appropriate inputs, disabled, with correct values", async () => {
    renderComponent();

    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Email").value).toBe("ben@example.com");

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeDisabled();
    expect(screen.getByLabelText("First Name").value).toBe("Ben");

    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeDisabled();
    expect(screen.getByLabelText("Last Name").value).toBe("Martin");

    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeDisabled();
    expect(screen.getByLabelText("Role").value).toBe("State");

    expect(screen.getByLabelText("States")).toBeInTheDocument();
    expect(screen.getByLabelText("States")).toBeDisabled();
    expect(screen.getByLabelText("States").value).toBe("CO");
  });
});
