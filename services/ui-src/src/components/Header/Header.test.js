import React from "react";
import Header from "./Header";
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

describe("Test Header.js", () => {
  test("Check if Header, exists", () => {
    useContextMock.mockReturnValue(true);

    const mockUser = { attributes: { "app-role": "admin" } };

    const { getByTestId } = render(<Header user={mockUser} />);

    expect(getByTestId("Header")).toBeVisible();
  });
});
