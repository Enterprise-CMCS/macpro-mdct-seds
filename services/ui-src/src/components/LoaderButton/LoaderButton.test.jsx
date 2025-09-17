import React from "react";
import { describe, expect, test } from "vitest";
import LoaderButton from "./LoaderButton";
import { render } from "@testing-library/react";

describe("Test LoaderButton.js", () => {
  test("Check the main element, with classname LoaderButton, exists", () => {
    const { getByTestId } = render(<LoaderButton />);

    expect(getByTestId("LoaderButton")).toBeVisible();
  });
});
