import React from "react";
import Signup from "./Signup";
import { render } from "@testing-library/react";

let realUseContext;
let useContextMock;

// *** set up mocks
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = jest.fn();
});

// *** garbage clean up (mocks)
afterEach(() => {
  React.useContext = realUseContext;
});

describe("Test LoaderButton.js", () => {
  test("Checks the main elements, and verify they exists", () => {
    useContextMock.mockReturnValue(true);
    const { getByTestId } = render(<Signup />);

    expect(getByTestId("LoaderButton")).toBeVisible();
    expect(getByTestId("parentComponent")).toBeVisible();
    expect(getByTestId("signup")).toBeVisible();
  });
  test("Check for First Name input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Signup />);
    const formControl = getByLabelText("First Name");
    expect(formControl.type).toContain("text");
  });
  test("Check for Last Name input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Signup />);
    const formControl = getByLabelText("Last Name");
    expect(formControl.type).toContain("text");
  });
  test("Check for Email input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Signup />);
    const formControl = getByLabelText("Email");
    expect(formControl.type).toContain("email");
  });
  test("Check for Password input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Signup />);
    const formControl = getByLabelText("Password");
    expect(formControl.type).toContain("password");
  });
  test("Check for Confirm Password input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Signup />);
    const formControl = getByLabelText("Confirm Password");
    expect(formControl.type).toContain("password");
  });
});
