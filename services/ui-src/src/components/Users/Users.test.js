import React from "react";
import Users from "./Users";
import { Button } from "@trussworks/react-uswds";
import { mount, shallow } from "enzyme";

const mockPush = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({ push: mockPush })
}));

describe("Test Users.js", () => {
  const wrapper = shallow(<Users />);

  describe("Users component- render should include its children", () => {
    test("Check the main element, with data-testid Users, exists", () => {
      expect(wrapper.find({ "data-testid": "Users" }).length).toBe(1);
      expect(wrapper.find(Button).length).toBe(3);
    });

    test("Check the buttons descriptions are accurate", () => {
      const detailedWrapper = mount(<Users />);
      const button = detailedWrapper.find(Button).children();

      expect(button.at(0).text()).toMatch("Add New User");
      expect(button.at(1).text()).toMatch("Excel");
      expect(button.at(2).text()).toMatch("PDF");
    });
  });

  describe("Users component should behave as expected when the user submits", () => {
    test("Check that our component pushes a new url when a new user is added", () => {
      expect(mockPush).not.toHaveBeenCalled();
      wrapper.find({ "data-testid": "HandleAddNewUser" }).simulate("click");
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });
});
