import React from "react";
import Home from "./Home";
import { shallow } from "enzyme";
let realUseContext;
let useContextMock;

describe("Test Home.js", () => {
  beforeEach(() => {
    realUseContext = React.useContext;
    useContextMock = React.useContext = jest.fn();
  });

  // *** garbage clean up (mocks)
  afterEach(() => {
    React.useContext = realUseContext;
  });

  test("Check the main div, with classname app, exists", () => {
    useContextMock.mockReturnValue(true);
    const mockUser = {
      attributes: { "app-role": "admin" }
    };

    const wrapper = shallow(<Home user={mockUser} />);
    expect(wrapper.find(".Home").length).toBe(1);
  });
});
