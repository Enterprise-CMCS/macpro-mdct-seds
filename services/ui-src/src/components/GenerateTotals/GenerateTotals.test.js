import React from "react";
import GenerateTotals from "./GenerateTotals";
import { Button } from "@trussworks/react-uswds";
import { shallow } from "enzyme";

describe("Test GenerateTotals.js", () => {
  const wrapper = shallow(<GenerateTotals />);

  test("Check the main div, with classname generate-forms-container and its child exist", () => {
    expect(wrapper.find(".generate-totals-container").length).toBe(1);
    expect(wrapper.find(Button).length).toBe(1);
  });

  describe("GenerateTotals component should behave as expected when the user submits", () => {
    test("Check that the generate forms button correctly calls the generateForms method with error message", () => {
      jest.spyOn(window, "confirm").mockImplementation(() => {});

      expect(window.confirm).not.toHaveBeenCalled();
      wrapper.find({ "data-testid": "generateTotalsButton" }).simulate("click");
      expect(window.confirm).toBeCalledWith(
        "You are about to create new Enrollment Totals. This action cannot be undone. Do you wish to proceed?"
      );
    });
  });
});
