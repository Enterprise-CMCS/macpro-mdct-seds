import React from "react";
import { describe, expect, test } from "vitest";
import Unauthorized from "./Unauthorized";
import { render, screen } from "@testing-library/react";

describe("Test Unauthorized.js", () => {
  test("Check that there is an email help button", () => {
    render(<Unauthorized />);
    const emailLink = screen.getByText("MDCT_Help@cms.hhs.gov", {
      selector: "a",
    });
    expect(emailLink).toBeInTheDocument();
  });
});
