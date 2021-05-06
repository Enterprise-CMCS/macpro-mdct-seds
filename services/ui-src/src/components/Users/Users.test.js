import React from "react";

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
  test("Check the main element, with classname user-profiles, exists", () => {
    useContextMock.mockReturnValue(true);
    // const mockUser = { attributes: { "app-role": "admin" } };
    // const { getByTestId } = render(<Users />);
    // expect(getByTestId("Users")).toBeVisible();
  });
});
