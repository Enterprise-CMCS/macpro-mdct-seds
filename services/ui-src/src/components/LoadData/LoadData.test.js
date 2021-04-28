import React from "react";
import LoadData from "./LoadData";
import { render } from "@testing-library/react";

// *** set up mocks
beforeEach(() => {});

// *** garbage clean up (mocks)
afterEach(() => {});

describe("testing LoadData component", () => {
  test("Check the main element renders correctly", () => {
    const { getByTestId } = render(<LoadData />);

    expect(getByTestId("LoadData")).toBeVisible();
  });
});
