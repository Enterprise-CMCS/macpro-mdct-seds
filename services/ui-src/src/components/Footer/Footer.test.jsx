import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Footer from "./Footer";
import { render } from "@testing-library/react";

let realUseContext;
let useContextMock;

// *** set up mocks
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = vi.fn();
});

// *** garbage clean up (mocks)
afterEach(() => {
  React.useContext = realUseContext;
});

describe("Test Footer.js", () => {
  test("Check the main element, with classname footer, exists", () => {
    useContextMock.mockReturnValue(true);

    const mockUser = { attributes: { "app-role": "admin" } };

    const { getByTestId } = render(<Footer user={mockUser} />);

    expect(getByTestId("Footer")).toBeVisible();
  });

  test("Check for MDCT SEDS Logo", () => {
    const { getByAltText } = render(<Footer />);
    const image = getByAltText("MDCT SEDS: Statistical Enrollment Data Systems, Medicaid Data Collection Tool");
    expect(image.src).toContain("/img/seds-logo.svg");
  });

  test("Check for CMS Home Page link", () => {
    const { getByText } = render(<Footer />);
    expect(
      getByText("Centers for Medicare & Medicaid Services Website")
    ).toHaveAttribute("href", "https://www.cms.gov/");
  });

  test("Check for SEDS Help Desk email link", () => {
    const { getByText } = render(<Footer />);
    expect(getByText("MDCT_Help@cms.hhs.gov")).toHaveAttribute(
      "href",
      "mailto:mdct_help@cms.hhs.gov"
    );
  });
});
