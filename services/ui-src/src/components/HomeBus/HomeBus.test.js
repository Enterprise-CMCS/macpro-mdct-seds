import React from "react";
import HomeBus from "./HomeBus";
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

describe("Test HomeBus.js", () => {
  test("Check the main element, with classname HomeBus, exists", () => {
    useContextMock.mockReturnValue(true);

    const { getByTestId } = render(<HomeBus />);

    expect(getByTestId("HomeBus")).toBeVisible();
  });
});
