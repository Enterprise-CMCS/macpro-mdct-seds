import React from "react";
import { Auth } from "aws-amplify";
import Login from "./Login";
import LoaderButton from "../LoaderButton/LoaderButton";
import { render } from "@testing-library/react";
import { shallow } from "enzyme";

let realUseContext;
let useContextMock;
let shallowComponent;

// *** set up mocks
beforeEach(() => {
  realUseContext = React.useContext;
  useContextMock = React.useContext = jest.fn();
  shallowComponent = shallow(<Login />);
});

// *** garbage clean up (mocks)
afterEach(() => {
  React.useContext = realUseContext;
});

describe("Test LoaderButton.js", () => {
  test("Checks the main elements, and verify they exists", () => {
    useContextMock.mockReturnValue(true);
    const { getByTestId } = render(<Login />);
    expect(getByTestId("Login")).toBeVisible();
  });
  test("Checks the main elements, and verify they exists", () => {
    useContextMock.mockReturnValue(true);
    const { getByTestId } = render(<Login />);
    expect(getByTestId("OktaLogin")).toBeVisible();
  });
  //These options are only available on development branches
  if (
    window.location.hostname !== "mdctseds.cms.gov" &&
    window.location.hostname !== "mdctsedsval.cms.gov"
  ) {
    test("Check for Email input box", () => {
      useContextMock.mockReturnValue(true);
      const { getByLabelText } = render(<Login />);
      const formControl = getByLabelText("Email");
      expect(formControl.type).toContain("email");
    });
    test("Check for Password input box", () => {
      useContextMock.mockReturnValue(true);
      const { getByLabelText } = render(<Login />);
      const formControl = getByLabelText("Password");
      expect(formControl.type).toContain("password");
    });
  }

  test("Check that LoaderButtons are rendering", () => {
    expect(shallowComponent.find(LoaderButton).length).toBe(2);
  });

  test("Check that our submit button behaves as expected", () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});

    expect(window.alert).not.toHaveBeenCalled();
    shallowComponent
      .find({ "data-testid": "handleSubmitOktaButton" })
      .simulate("click", {
        preventDefault: () => {}
      });
    expect(window.alert).toHaveBeenCalled();
  });

  test("Check that our submit behavior to be rejected without login information", async () => {
    shallowComponent.find({ "data-testid": "loginForm" }).simulate("submit", {
      preventDefault: () => {}
    });
    await expect(Auth.signIn()).rejects.toBeTruthy();
  });
});
