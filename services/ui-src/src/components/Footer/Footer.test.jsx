import React from "react";
import Footer from "./Footer";
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

  test("Check for HHS Logo", () => {
    const { getByAltText } = render(<Footer />);
    const image = getByAltText("Department of Health and Human Services, USA");
  expect(image.src).toContain("/img/logo_hhs.svg");
  });

  // Todo: Fix breakpoint issue
  // test("Check for Medicaid Logo", () => {
  //   const { getByAltText } = render(<Footer />);
  //   const image = getByAltText("Medicaid.gov: Keeping America Healthy");
  // expect(image.src).toContain("/img/logo_medicaid.svg");
  // });

  test("Check for CMS Contact Us link", () => {
    const { getByText } = render(<Footer />);
    expect(
      getByText("Contact Us")
    ).toHaveAttribute("href", "https://www.cms.gov/help");
  });
});
