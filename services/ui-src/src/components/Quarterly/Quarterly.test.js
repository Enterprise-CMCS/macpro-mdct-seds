import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Quarterly from "../Quarterly/Quarterly";
import quarterlyDataMock from "../../provider-mocks/quarterlyDataMock";

const mockStore = configureStore([]);
let store;
let wrapper;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    state: "AL",
    year: "2021",
    quarter: "01",
    formName: "21E"
  })
}));

describe("Quarterly tests", () => {
  // Cache original functionality
  const realUseState = React.useState;
  // Stub the initial state
  const mockInitialState = quarterlyDataMock;
  // Mock useState before rendering your component
  jest
    .spyOn(React, "useState")
    .mockImplementationOnce(() => realUseState(mockInitialState));

  store = mockStore(mockStore);
  wrapper = mount(
    <Provider store={store}>
      <BrowserRouter>
        <Quarterly />
      </BrowserRouter>
    </Provider>
  );
  test("Check that the links to the state forms contain the correct text", () => {
    expect(wrapper.find("#row-0").find("a").at(0).text()).toMatch("GRE");
    expect(wrapper.find("#row-1").find("a").at(0).text()).toMatch("21PW");
    expect(wrapper.find("#row-2").find("a").at(0).text()).toMatch("64.21E");
    expect(wrapper.find("#row-3").find("a").at(0).text()).toMatch("21E");
    expect(wrapper.find("#row-4").find("a").at(0).text()).toMatch("64.EC");
  });
});
