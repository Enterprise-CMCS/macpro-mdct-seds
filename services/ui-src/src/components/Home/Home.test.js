import React from "react";
import Home from "./Home";
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

describe("Test ExportToPdf.js", () => {
  test("Check the main element, with classname Home, exists", () => {
    useContextMock.mockReturnValue(true);

    const mockUser = { attributes: { "app-role": "admin" } };

    const { getByTestId } = render(<Home user={mockUser} />);

    expect(getByTestId("Home")).toBeVisible();
  });
});
