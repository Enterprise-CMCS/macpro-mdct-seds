import React from "react";
import Unauthorized from "./Unauthorized";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { shallow } from "enzyme";

describe("Test Unauthorized.js", () => {
  const wrapper = shallow(<Unauthorized />);

  test("Check the main element, with classname unauthorized, exists", () => {
    expect(wrapper.find({ "data-testid": "unauthorizedTest" }).length).toBe(1);
  });

  test("Check that the component renders its child components", () => {
    expect(wrapper.find(GridContainer).length).toBe(1);
    expect(wrapper.find(Grid).length).toBe(2);
  });

  test("Check that there is an email help button", () => {
    expect(
      wrapper.find({ href: "mailto:mdct_help@cms.hhs.gov" }).text()
    ).toMatch("MDCT_Help@cms.hhs.gov");
  });
});
