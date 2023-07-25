import React from "react";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
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
const mockUser = {
  Items: [
    {
      status: "success",
      email: "email@email.com",
      name: "Test User",
      states: ["AL"],
      role: "state"
    }
  ]
};
const mockQuartelyData = quarterlyDataMock;
jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: () => Promise.resolve(mockUser)
}));
jest.mock("../../libs/api", () => ({
  obtainUserByEmail: () => mockUser
}));
jest.mock("../../utility-functions/dbFunctions", () => ({
  recursiveGetStateForms: () => Promise.resolve(mockQuartelyData)
}));

describe("Quarterly tests", () => {
  const wrapperComponent = (
    <Provider store={store}>
      <BrowserRouter>
        <Quarterly />
      </BrowserRouter>
    </Provider>
  );

  test("Check that the title and path are generated with the correct text", async () => {
    await act(async () => {
      wrapper = await mount(wrapperComponent);
    });
    expect(wrapper.find(".page-quarterly").find("h1").at(0).text()).toMatch(
      "Q01 2021 Reports"
    );
    expect(wrapper.find(".breadcrumbs").text()).toContain(
      "Enrollment Data Home > AL Q01 2021"
    );
  });

  test("Check that the links to the state forms contain the correct text", async () => {
    await act(async () => {
      wrapper = await mount(wrapperComponent);
    });
    expect(wrapper.find({ children: "GRE" }));
    expect(wrapper.find({ children: "21PW" }));
    expect(wrapper.find({ children: "64.21E" }));
    expect(wrapper.find({ children: "21E" }));
    expect(wrapper.find({ children: "64.EC" }));
  });

  test("Check that the form names contain the correct text", async () => {
    await act(async () => {
      wrapper = await mount(wrapperComponent);
    });
    expect(wrapper.find({ children: "Gender, Race & Ethnicity" }));
    expect(wrapper.find({ children: "Number of Pregnant Women Served" }));
    expect(
      wrapper.find({
        children: "Number of Children Served in Medicaid Expansion Program"
      })
    );
    expect(
      wrapper.find({
        children: "Number of Children Served in Separate CHIP Program"
      })
    );
    expect(
      wrapper.find({
        children: "Number of Children Served in Medicaid Program"
      })
    );
  });

  test("Check that the status of each form is correct", async () => {
    await act(async () => {
      wrapper = await mount(wrapperComponent);
    });
    expect(wrapper.find({ children: "In Progress" }));
    expect(
      wrapper.find({ children: "Provisional Data Certified and Submitted" })
    );
    expect(wrapper.find({ children: "Final Data Certified and Submitted" }));
  });

  test("Check that the status dates are correct", async () => {
    await act(async () => {
      wrapper = await mount(wrapperComponent);
    });
    expect(wrapper.find({ children: "04-07-2021 at 8:00:00 pm EST" }));
    expect(wrapper.find({ children: "04-06-2021 at 8:00:00 pm EST" }));
    expect(wrapper.find({ children: "04-05-2021 at 8:00:00 pm EST" }));
    expect(wrapper.find({ children: "04-04-2021 at 8:00:00 pm EST" }));
    expect(wrapper.find({ children: "04-03-2021 at 8:00:00 pm EST" }));
  });
});
