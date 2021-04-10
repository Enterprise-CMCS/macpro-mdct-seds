import React from "react";
import Unauthorized from "./Unauthorized";
import { render } from "@testing-library/react";

describe("Test Unauthorized.js", () => {
  test("Check the main element, with classname unauthorized, exists", () => {
    const { getByTestId } = render(<Unauthorized />);

    expect(getByTestId("unauthorizedTest")).toBeVisible();
  });
});
