import React from "react";
import Signup from "./Signup";
import { render, screen, waitFor } from "@testing-library/react";
import { useAppContext } from "../../libs/contextLib";
import { useHistory } from "react-router-dom";
import { Auth } from "aws-amplify";
import userEvent from "@testing-library/user-event";

jest.spyOn(window, "alert").mockImplementation(
  (message) => console.error(message)
);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn().mockReturnValue([]),
}));

jest.mock("../../libs/contextLib", () => ({
  useAppContext: jest.fn().mockReturnValue({}),
}));

jest.mock("aws-amplify", () => ({
  Auth: {
    signUp: jest.fn(),
    confirmSignUp: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue(true),
  },
}));

describe("Test Signup.js", () => {
  it("should render a form", () => {
    render(<Signup/>);
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText("User Type")).toBeInTheDocument();
    expect(screen.getByText("Sign Up", { selector: "button" })).toBeInTheDocument();
  });

  it("should sign up new users", async () => {
    render(<Signup/>);

    const signUpButton = screen.getByText("Sign Up", { selector: "button" });
    expect(signUpButton).toBeDisabled();

    await userEvent.type(screen.getByLabelText("First Name"), "Quentin");
    await userEvent.type(screen.getByLabelText("Last Name"), "Werther");
    await userEvent.type(screen.getByLabelText("Email"), "qwer@email.test");
    await userEvent.type(screen.getByLabelText("Password"), "hunter2");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "hunter2");
    await userEvent.selectOptions(screen.getByLabelText("User Type"), "State User");

    expect(signUpButton).not.toBeDisabled();
    await userEvent.click(signUpButton);

    expect(Auth.signUp).toHaveBeenCalledWith({
      username: "qwer@email.test",
      password: "hunter2",
      attributes: {
        given_name: "Quentin",
        family_name: "Werther",
        "custom:ismemberof": "CHIP_D_USER_GROUP",
      },
    });
  });

  it("should render an email confirmation form after users sign up", async () => {
    render(<Signup/>);

    await userEvent.type(screen.getByLabelText("First Name"), "Quentin");
    await userEvent.type(screen.getByLabelText("Last Name"), "Werther");
    await userEvent.type(screen.getByLabelText("Email"), "qwer@email.test");
    await userEvent.type(screen.getByLabelText("Password"), "hunter2");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "hunter2");
    await userEvent.selectOptions(screen.getByLabelText("User Type"), "State User");
    await userEvent.click(screen.getByText("Sign Up", { selector: "button" }));

    expect(screen.getByText("Please check your email for the code.")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmation Code")).toBeInTheDocument();
    expect(screen.getByText("Verify", { selector: "button" })).toBeInTheDocument();
  });

  it("should log in users who confirm their email", async () => {
    const mockSetAuthenticated = jest.fn();
    useAppContext.mockReturnValue({
      setIsAuthenticated: mockSetAuthenticated,
    });
    const mockHistoryPush = jest.fn();
    useHistory.mockReturnValue({
      push: mockHistoryPush,
    });
    render(<Signup/>);

    await userEvent.type(screen.getByLabelText("First Name"), "Quentin");
    await userEvent.type(screen.getByLabelText("Last Name"), "Werther");
    await userEvent.type(screen.getByLabelText("Email"), "qwer@email.test");
    await userEvent.type(screen.getByLabelText("Password"), "hunter2");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "hunter2");
    await userEvent.selectOptions(screen.getByLabelText("User Type"), "State User");
    await userEvent.click(screen.getByText("Sign Up", { selector: "button" }));

    await userEvent.type(screen.getByLabelText("Confirmation Code"), "12345");
    await userEvent.click(screen.getByText("Verify", { selector: "button" }));

    await waitFor(() => {
      expect(Auth.confirmSignUp).toHaveBeenCalledWith("qwer@email.test", "12345");
      expect(Auth.signIn).toHaveBeenCalledWith("qwer@email.test", "hunter2");
      expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      expect(mockHistoryPush).toHaveBeenCalledWith("/");
    });
  });
});
