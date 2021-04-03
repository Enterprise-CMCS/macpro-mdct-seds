import React from "react";
import { mount } from "enzyme";
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

    test("Check for CMS Logo", () => {
        const { getByAltText } = render(<Footer />);
        const image = getByAltText('Centers for Medicare and Medicaid Services');
        expect(image.src).toContain('/img/logo-cms.png');
    });

    test("Check for MDCT Logo", () => {
        const { getByAltText } = render(<Footer />);
        const image = getByAltText('Medicaid & CHIP Program System');
        expect(image.src).toContain('/img/logo-mdct.png');
    });
});
