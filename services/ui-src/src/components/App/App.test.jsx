import React from "react";
import App from "./App";
import { shallow } from "enzyme";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:3000/example/path"
  })
}));

describe("Test App.js", () => {
  test("Check the main div, with classname app, exists", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(".App").length).toBe(1);
  });
});
