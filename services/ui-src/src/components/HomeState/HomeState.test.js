import React from "react";
import HomeState from "./HomeState";
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

describe("Test HomeState.js", () => {
  test("Check the main element, with classname Home, exists", () => {
    useContextMock.mockReturnValue(true);

    const mockUser = { attributes: { "states": "Pa" } };

    const { getByTestId } = render(<HomeState states={mockUser} />);

    expect(getByTestId("page-home-state")).toBeVisible();
  });
});
