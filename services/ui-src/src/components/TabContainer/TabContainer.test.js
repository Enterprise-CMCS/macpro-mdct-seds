import React from "react";
import { mount } from "enzyme";
import TabContainer from "./TabContainer";
import configureStore from "redux-mock-store";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { Provider } from "react-redux";

const mockstore = configureStore([]);

describe("TabContainer tests", () => {
  let store;
  let wrapper;

  beforeEach(() => {
    store = mockstore(fullStoreMock);
    wrapper = mount(
      <Provider store={store}>
        <TabContainer />
      </Provider>
    );
  });

  test("Main tabcontainer div with classname tab-container-main loads", () => {
    expect(wrapper.find(".tab-container-main").length).toBe(3);
  });

  test("Check tab list", () => {
    expect(wrapper.find(".react-tabs__tab-list").length).toBe(2);
  });

  test("Check tab titles", () => {
    const tabs = wrapper.find(".react-tabs__tab-list").children().find("li");
    expect(tabs.at(0).text()).toMatch("Under Age 0");
    expect(tabs.at(1).text()).toMatch("Ages 0 - 1");
    expect(tabs.at(2).text()).toMatch("Ages 1 - 5");
    expect(tabs.at(3).text()).toMatch("Ages 6 - 12");
    expect(tabs.at(4).text()).toMatch("Ages 13 - 18");
    expect(tabs.at(5).text()).toMatch("Summary");
    expect(tabs.at(6).text()).toMatch("Certification");
  });

  test("Check tab header values", () => {
    let tabControl;

    // Get all tab lists
    const tabs = wrapper.find(".react-tabs__tab-list").children().find("li");

    // Check first tab title
    tabs.at(0).simulate("click");
    tabControl = tabs.at(0).prop("aria-controls");
    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Conception to birth:");

    // Simulate click on second attribute
    tabs.at(1).simulate("click");

    // Retrieve id for tab content ID
    tabControl = tabs.at(1).prop("aria-controls");

    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Birth through age 12 months:");

    // Simulate click on third attribute
    tabs.at(2).simulate("click");
    tabControl = tabs.at(2).prop("aria-controls");

    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Age 1 year through age 5 years:");

    // Simulate click on fourth attribute
    tabs.at(3).simulate("click");
    tabControl = tabs.at(3).prop("aria-controls");

    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Age 6 years through age 12 years:");

    // Simulate click on fifth attribute
    tabs.at(4).simulate("click");
    tabControl = tabs.at(4).prop("aria-controls");

    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Age 13 years through age 18 years:");

    // Simulate click on sixth attribute
    tabs.at(5).simulate("click");
    tabControl = tabs.at(5).prop("aria-controls");

    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Summary:");

    // Simulate click on seventh attribute
    tabs.at(6).simulate("click");
    tabControl = tabs.at(6).prop("aria-controls");

    expect(
      wrapper
        .find("#" + tabControl)
        .children()
        .find(".age-range-description")
        .children()
        .find("h3")
        .text()
    ).toMatch("Certify and Submit:");
  });
});
