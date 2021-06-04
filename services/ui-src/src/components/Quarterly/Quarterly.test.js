import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Quarterly from "../Quarterly/Quarterly";
import quarterlyDataMock from "../../provider-mocks/quarterlyDataMock";

const mockStore = configureStore([]);
let store = mockStore(mockStore);
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
  // Mock useState before rendering your component to set initial state values
  jest
    .spyOn(React, "useState")
    .mockReturnValueOnce([quarterlyDataMock, {}])
    .mockReturnValueOnce([true, {}]);

  wrapper = mount(
    <Provider store={store}>
      <BrowserRouter>
        <Quarterly />
      </BrowserRouter>
    </Provider>
  );

  test("Check that the title and path are generated with the correct text", () => {
    expect(wrapper.find(".page-quarterly").find("h1").at(0).text()).toMatch(
      "Q01 2021 Reports"
    );
    expect(wrapper.find(".breadcrumbs").text()).toContain(
      "Enrollment Data Home > AL Q01 2021"
    );
  });

  test("Check that the links to the state forms contain the correct text", () => {
    expect(wrapper.find("#row-0").find("a").at(0).text()).toMatch("GRE");
    expect(wrapper.find("#row-1").find("a").at(0).text()).toMatch("21PW");
    expect(wrapper.find("#row-2").find("a").at(0).text()).toMatch("64.21E");
    expect(wrapper.find("#row-3").find("a").at(0).text()).toMatch("21E");
    expect(wrapper.find("#row-4").find("a").at(0).text()).toMatch("64.EC");
  });

  test("Check that the form names contain the correct text", () => {
    expect(wrapper.find("#row-0").find("p").at(0).text()).toMatch(
      "Gender, Race & Ethnicity"
    );
    expect(wrapper.find("#row-1").find("p").at(0).text()).toMatch(
      "Number of Pregnant Women Served"
    );
    expect(wrapper.find("#row-2").find("p").at(0).text()).toMatch(
      "Number of Children Served in Medicaid Expansion Program"
    );
    expect(wrapper.find("#row-3").find("p").at(0).text()).toMatch(
      "Number of Children Served in Separate CHIP Program"
    );
    expect(wrapper.find("#row-4").find("p").at(0).text()).toMatch(
      "Number of Children Served in Medicaid Program"
    );
  });

  test("Check that the status of each form is correct", () => {
    expect(wrapper.find("#row-0").find("button").at(0).text()).toMatch(
      "Not Started"
    );
    expect(wrapper.find("#row-1").find("button").at(0).text()).toMatch(
      "In Progress"
    );
    expect(wrapper.find("#row-2").find("button").at(0).text()).toMatch(
      "Provisional Data Certified and Submitted"
    );
    expect(wrapper.find("#row-3").find("button").at(0).text()).toMatch(
      "Final Data Certified and Submitted"
    );
    expect(wrapper.find("#row-4").find("button").at(0).text()).toMatch(
      "Final Data Certified and Submitted"
    );
  });

  test("Check that the status dates are correct", () => {
    expect(wrapper.find("#row-0").find("div").at(6).text()).toMatch(
      "04-08-2021"
    );
    expect(wrapper.find("#row-1").find("div").at(6).text()).toMatch(
      "04-07-2021"
    );
    expect(wrapper.find("#row-2").find("div").at(6).text()).toMatch(
      "04-06-2021"
    );
    expect(wrapper.find("#row-3").find("div").at(6).text()).toMatch(
      "04-05-2021"
    );
    expect(wrapper.find("#row-4").find("div").at(6).text()).toMatch(
      "04-04-2021"
    );
  });
});
