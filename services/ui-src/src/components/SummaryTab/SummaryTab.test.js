import React from "react";
import { mount } from "enzyme";
import SummaryTab from "./SummaryTab";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";
import SummaryNotes from "../SummaryNotes/SummaryNotes";

const mockStore = configureStore([]);

describe("Test SummaryTab.js", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockStore(currentFormMock_21E);
    wrapper = mount(
      <Provider store={store}>
        <SummaryTab />
      </Provider>
    );
  });

  test("Check the main div, with classname app, exists", () => {
    expect(wrapper.find(".summary-tab").length).toBe(1);
  });

  test("Check for appropriate tab header", () => {
    expect(wrapper.find(".summary-tab").children().find("h3").text()).toMatch(
      /Summary:/
    );
  });

  test("Check for all top headers", () => {
    expect(wrapper.text()).toMatch(/% of FPL 0-133/);
    expect(wrapper.text()).toMatch(/% of FPL 134-200/);
    expect(wrapper.text()).toMatch(/% of FPL 201-250/);
    expect(wrapper.text()).toMatch(/% of FPL 251-300/);
    expect(wrapper.text()).toMatch(/% of FPL 301-317/);
  });

  test("Check for all side headers", () => {
    expect(wrapper.text()).toMatch(/A. Fee-for-Service/);
    expect(wrapper.text()).toMatch(/B. Managed Care Arrangements/);
    expect(wrapper.text()).toMatch(/C. Primary Care Case Management/);
  });

  test("Check number of gridwithtotal elements", () => {
    expect(wrapper.find(".grid-with-totals").length).toBe(9);
  });

  test("Check table input values for correct math", () => {
    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(0)
        .children()
        .find("span")
        .text()
    ).toMatch(/2/);

    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(1)
        .children()
        .find("span")
        .text()
    ).toMatch(/4/);

    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(2)
        .children()
        .find("span")
        .text()
    ).toMatch(/6/);

    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(3)
        .children()
        .find("span")
        .text()
    ).toMatch(/8/);
    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(4)
        .children()
        .find("span")
        .text()
    ).toMatch(/10/);
  });
  test("Check for Summary Notes component", () => {
    expect(wrapper.contains(<SummaryNotes />)).toBe(true);
  });
});
