import React from "react";
import Home from "./Home";
import { render } from "@testing-library/react";

let realUseContext;
let useContextMock;

const mockUser = { attributes: { "app-role": "admin" } };

let component;

// *** set up mocks
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = jest.fn();

  const { getByTestId } = render(<Home user={mockUser} />);
  component = getByTestId;
});

// *** garbage clean up (mocks)
afterEach(() => {
  React.useContext = realUseContext;
});

describe("Test Home.js", () => {
  test("Check the main element, with classname Home, exists", () => {
    useContextMock.mockReturnValue(true);
    expect(component("Home")).toBeVisible();
  });
});
