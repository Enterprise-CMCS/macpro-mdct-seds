import React from "react";
import { describe, expect, test } from "vitest";
import FormLoadError from "./FormLoadError";
import { render, screen } from "@testing-library/react";

describe("Test FormLoadError.js", () => {
  test("Check that the component renders", () => {
    render(<FormLoadError />);
    expect(screen.getByText("Error Retrieving Form")).toBeInTheDocument();
    const helpLink = screen.getByText("MDCT_Help@cms.hhs.gov", { selector: "a" });
    expect(helpLink).toBeInTheDocument();
    expect(helpLink).toHaveAttribute("href", "mailto:mdct_help@cms.hhs.gov");
  });
});
