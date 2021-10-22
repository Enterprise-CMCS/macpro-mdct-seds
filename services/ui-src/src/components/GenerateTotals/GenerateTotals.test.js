import React from "react";
import GenerateTotals from "./GenerateTotals";
import { Button } from "@trussworks/react-uswds";
import { mount, shallow } from "enzyme";

describe("Test GenerateTotals.js", () => {
  const wrapper = shallow(<GenerateTotals />);

  describe("GenerateTotals component should render its child components ", () => {
    test("Check the main div, with classname generate-forms-container and its children exist", () => {
      expect(wrapper.find(".generate-totals-container").length).toBe(1);
      expect(wrapper.find(Button).length).toBe(1);
    });

    test("Check the button descriptions are accurate", () => {
      const detailedWrapper = mount(<GenerateTotals />);
      const button = detailedWrapper.find(Button).children();

      expect(button.at(0).text()).toMatch("Generate Enrollment Totals");
    });
  });

  describe("GenerateTotals component should correctly submit", () => {
    test("Check that the generate forms button correctly calls the generateTotals method with a confirmation", () => {
      jest.spyOn(window, "confirm").mockImplementation(() => {});

      expect(window.confirm).not.toHaveBeenCalled();
      wrapper.find({ "data-testid": "generateTotalsButton" }).simulate("click");
      expect(window.confirm).toBeCalledWith(
        "You are about to create new Enrollment Totals. This action cannot be undone. Do you wish to proceed?"
      );
    });
  });
});
