import React from "react";
import Users from "./Users";
import { Button } from "@trussworks/react-uswds";
import { shallow } from "enzyme";

const mockPush = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({ push: mockPush })
}));

describe("Test Users.js", () => {
  const wrapper = shallow(<Users />);

  test("Check the main element, with data test id Users, exists", () => {
    expect(wrapper.find({ "data-testid": "Users" }).length).toBe(1);
    expect(wrapper.find(Button).length).toBe(3);
  });

  describe("Users component should behave as expected when the user submits", () => {
    test("Check that our component pushes a new url when a new user is added", () => {
      expect(mockPush).not.toHaveBeenCalled();
      wrapper.find({ "data-testid": "HandleAddNewUser" }).simulate("click");
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });
});
