import React from "react";
import { Auth } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import Profile from "./Profile";
import { mount } from "enzyme";

describe("Test SummaryTab.js", () => {
  let wrapper;
  const mockPush = jest.fn();
  jest.mock("react-router", () => ({
    ...jest.requireActual("react-router"),
    useHistory: () => ({ push: mockPush })
  }));

  beforeEach(() => {
    wrapper = mount(<Profile />);
  });

  describe("Profile component- render should include its children and correct behavior", () => {
    test("Check the main div exists", () => {
      expect(wrapper.find(".Profile").length).toBe(1);
    });

    test("Check for all fields exists", () => {
      expect(wrapper.find("#email").length).toBe(1);
      expect(wrapper.find("#firstName").length).toBe(1);
      expect(wrapper.find("#lastName").length).toBe(1);
      expect(wrapper.find("#role").length).toBe(1);
      expect(wrapper.find("#states").length).toBe(1);
    });

    test("Check that Profiles' child components are being rendered", () => {
      expect(wrapper.find(FormGroup).length).toBe(5);
      expect(wrapper.find(ControlLabel).length).toBe(5);
      expect(wrapper.find(FormControl).length).toBe(5);
    });
  });
});
