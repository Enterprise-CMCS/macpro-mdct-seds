import React from "react";
import Dropdown from "react-dropdown";
import GenerateForms from "./GenerateForms";
import { Button } from "@trussworks/react-uswds";
import { mount, shallow } from "enzyme";

describe("Test GenerateForms.js", () => {
  const wrapper = shallow(<GenerateForms />);

  describe("GenerateForms component- shallow render should include its children", () => {
    test("Check the main div, with classname generate-forms-container, exists", () => {
      expect(wrapper.find(".generate-forms-container").length).toBe(1);
      expect(
        wrapper.find({ "data-testid": "generateFormsButton" }).length
      ).toBe(1);
    });

    test("Check that GenerateForms' child react components are being rendered", () => {
      expect(wrapper.find(Dropdown).length).toBe(2);
      expect(wrapper.find(Button).length).toBe(1);
    });

    test("Check the drop down and button descriptions are accurate", () => {
      const detailedWrapper = mount(<GenerateForms />);
      const dropdowns = detailedWrapper.find(Dropdown).children();
      expect(dropdowns.at(0).text()).toMatch("Select a Year");
      expect(dropdowns.at(1).text()).toMatch("Select a Quarter");

      const button = detailedWrapper.find(Button).children();
      expect(button.at(0).text()).toMatch("Generate Forms");
    });
  });

  describe("GenerateForms component should behave as expected when the user interacts with the page", () => {
    test("Check that the generate forms button correctly calls the generateForms method with error message", () => {
      jest.spyOn(window, "alert").mockImplementation(() => {});

      expect(window.alert).not.toHaveBeenCalled();
      wrapper.find({ "data-testid": "generateFormsButton" }).simulate("click");
      expect(window.alert).toBeCalledWith("Please select a Year and Quarter");
    });
  });
});
