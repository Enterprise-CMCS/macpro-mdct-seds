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
});
