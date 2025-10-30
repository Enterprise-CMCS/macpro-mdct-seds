import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import Footer from "./Footer";

let realUseContext;
let useContextMock;

// Setup mocks
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = vi.fn();
});

// Cleanup mocks
afterEach(() => {
  React.useContext = realUseContext;
});

describe("Footer Component", () => {
  it("renders footer element with correct test id", () => {
    useContextMock.mockReturnValue(true);
    const mockUser = { attributes: { "app-role": "admin" } };
    const { getByTestId } = render(<Footer user={mockUser} />);
    expect(getByTestId("Footer")).toBeVisible();
  });

  it("displays MDCT SEDS logo with correct src and alt text", () => {
    const { getByAltText } = render(<Footer />);
    const image = getByAltText(
      "MDCT SEDS: Statistical Enrollment Data Systems, Medicaid Data Collection Tool"
    );
    expect(image).toBeVisible();
    expect(image.src).toContain("/img/seds-logo.svg");
  });

  it("displays HHS logo with correct src and alt text", () => {
    const { getByAltText } = render(<Footer />);
    const image = getByAltText("Department of Health and Human Services, USA");
    expect(image).toBeVisible();
    expect(image.src).toContain("/img/logo_hhs.svg");
  });

  it("displays both Medicaid logos (mobile and desktop versions)", () => {
    const { getAllByAltText } = render(<Footer />);
    const medicaidLogos = getAllByAltText(
      "Medicaid.gov: Keeping America Healthy"
    );
    expect(medicaidLogos).toHaveLength(2);
    medicaidLogos.forEach(logo => {
      expect(logo.src).toContain("/img/logo_medicaid.svg");
    });
  });

  it("renders Contact Us link with correct href", () => {
    const { getByText } = render(<Footer />);
    const contactLink = getByText("Contact Us");
    expect(contactLink).toBeVisible();
    expect(contactLink).toHaveAttribute("href", "mailto:mdct_help@cms.hhs.gov");
  });

  it("renders Accessibility Statement link with correct href", () => {
    const { getByText } = render(<Footer />);
    const accessibilityLink = getByText("Accessibility Statement");
    expect(accessibilityLink).toBeVisible();
    expect(accessibilityLink).toHaveAttribute(
      "href",
      "https://www.cms.gov/About-CMS/Agency-Information/Aboutwebsite/CMSNondiscriminationNotice"
    );
    expect(accessibilityLink).toHaveAttribute("target", "_blank");
  });

  it("displays CMS copy text", () => {
    const { getByText } = render(<Footer />);
    const copyText = getByText(
      /A federal government website managed and paid for by the U.S. Centers for Medicare and Medicaid Services/
    );
    expect(copyText).toBeVisible();
  });

  it("displays CMS address", () => {
    const { getByText } = render(<Footer />);
    const address = getByText("7500 Security Boulevard Baltimore, MD 21244");
    expect(address).toBeVisible();
  });
});
