import React from "react";
import { mount } from "enzyme";
import GridWithTotals from "./GridWithAverages";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";
const mockStore = configureStore([]);

describe("Test GridWithAverages.js", () => {
  let store;
  let wrapper;
  const gridDataItems = [
    {
      col1: "",
      col2: "% of FPL 0-133",
      col3: "% of FPL 134-200",
      col4: "% of FPL 201-250",
      col5: "% of FPL 251-300",
      col6: "% of FPL 301-317"
    },
    {
      col1: "A. Fee-for-Service",
      col2: 1,
      col3: 2,
      col4: 3,
      col5: 4,
      col6: 5
    },
    {
      col1: "B. Managed Care Arrangements",
      col2: 21,
      col3: 22,
      col4: 23,
      col5: 24,
      col6: 25
    },
    {
      col1: "C. Primary Care Case Management",
      col2: 26,
      col3: 27,
      col4: 28,
      col5: 29,
      col6: 30
    }
  ];

  beforeEach(() => {
    store = mockStore(currentFormMock_21E);
    wrapper = mount(
      <Provider store={store}>
        <GridWithTotals gridData={gridDataItems} />
      </Provider>
    );
  });

  test("Check the main div, with classname app, exists", () => {
    expect(wrapper.find(".grid-with-totals").length).toBe(1);
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

  test("Check table input values from provided data", () => {
    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(0)
        .children()
        .find("input")
        .instance().value
    ).toMatch(/1/);

    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(1)
        .children()
        .find("input")
        .instance().value
    ).toMatch(/2/);

    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(2)
        .children()
        .find("input")
        .instance().value
    ).toMatch(/3/);

    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(3)
        .children()
        .find("input")
        .instance().value
    ).toMatch(/4/);
    expect(
      wrapper
        .find("tbody")
        .children()
        .find("td")
        .at(4)
        .children()
        .find("input")
        .instance().value
    ).toMatch(/5/);
  });
  test("Check table output values after addition occurs", () => {
    expect(
      wrapper.find(".total-row").children().find("td").at(0).text()
    ).toMatch(/48/);
    expect(
      wrapper.find(".total-row").children().find("td").at(1).text()
    ).toMatch(/51/);
    expect(
      wrapper.find(".total-row").children().find("td").at(2).text()
    ).toMatch(/54/);
    expect(
      wrapper.find(".total-row").children().find("td").at(3).text()
    ).toMatch(/57/);
    expect(
      wrapper.find(".total-row").children().find("td").at(4).text()
    ).toMatch(/60/);
    expect(
      wrapper.find(".total-row").children().find("td").at(5).text()
    ).toMatch(/270/);
  });
});
