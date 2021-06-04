import React from "react";
import { render } from "@testing-library/react";

import StatusButton from "./StatusButton";

describe("Test StatusButton.js", () => {
  test("Check the main element, with classname StatusButton, exists and the default status (In Progress) renders", () => {
    const { getByTestId } = render(<StatusButton />);
    expect(getByTestId("StatusButton")).toBeVisible();
  });

  test("Check the Complete status renders", () => {
    const { getByTestId } = render(<StatusButton type="complete" />);
    expect(getByTestId("StatusButton")).toBeVisible();
  });

  test("Check the Final status renders", () => {
    const { getByTestId } = render(<StatusButton type="final" />);
    expect(getByTestId("StatusButton")).toBeVisible();
  });

  test("Check the Provisional status renders", () => {
    const { getByTestId } = render(<StatusButton type="provisional" />);
    expect(getByTestId("StatusButton")).toBeVisible();
  });

  test("Check the Not Applicable status renders", () => {
    const { getByTestId } = render(<StatusButton type="notapplicable" />);
    expect(getByTestId("StatusButton")).toBeVisible();
  });

  test("Check the In Progress status renders", () => {
    const { getByTestId } = render(<StatusButton type="inprogress" />);
    expect(getByTestId("StatusButton")).toBeVisible();
  });
});
