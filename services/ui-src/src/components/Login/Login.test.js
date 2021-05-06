import React from "react";
import Login from "./Login";
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
    const { getByTestId } = render(<Login />);
    expect(getByTestId("Login")).toBeVisible();
  });
  test("Checks the main elements, and verify they exists", () => {
    useContextMock.mockReturnValue(true);
    const { getByTestId } = render(<Login />);
    expect(getByTestId("OktaLogin")).toBeVisible();
  });
  test("Check for Email input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Login />);
    const formControl = getByLabelText("Email");
    expect(formControl.type).toContain("email");
  });
  test("Check for Password input box", () => {
    useContextMock.mockReturnValue(true);
    const { getByLabelText } = render(<Login />);
    const formControl = getByLabelText("Password");
    expect(formControl.type).toContain("password");
  });
});
