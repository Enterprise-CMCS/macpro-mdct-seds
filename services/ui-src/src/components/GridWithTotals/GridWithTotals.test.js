import React from "react";
import { mount } from "enzyme";
import GridWithTotals from "./GridWithTotals";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";
import SummaryTab from "../SummaryTab/SummaryTab";
const mockStore = configureStore([]);

describe("Test GridWithTotals.js", () => {
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
  //
  // test("Check for all side headers", () => {
  //     expect(wrapper.text()).toMatch(/A. Fee-for-Service/);
  //     expect(wrapper.text()).toMatch(/B. Managed Care Arrangements/);
  //     expect(wrapper.text()).toMatch(/C. Primary Care Case Management/);
  // });
  //
  // test("Check number of gridwithtotal elements", () => {
  //     expect(wrapper.find(".grid-with-totals").length).toBe(8);
  // });
  //
  // test("Check table input values for correct math", () => {
  //     expect(
  //         wrapper
  //             .find("tbody")
  //             .children()
  //             .find("td")
  //             .at(0)
  //             .children()
  //             .find("input")
  //             .instance().value
  //     ).toMatch(/2/);
  //
  //     expect(
  //         wrapper
  //             .find("tbody")
  //             .children()
  //             .find("td")
  //             .at(1)
  //             .children()
  //             .find("input")
  //             .instance().value
  //     ).toMatch(/4/);
  //
  //     expect(
  //         wrapper
  //             .find("tbody")
  //             .children()
  //             .find("td")
  //             .at(2)
  //             .children()
  //             .find("input")
  //             .instance().value
  //     ).toMatch(/6/);
  //
  //     expect(
  //         wrapper
  //             .find("tbody")
  //             .children()
  //             .find("td")
  //             .at(3)
  //             .children()
  //             .find("input")
  //             .instance().value
  //     ).toMatch(/8/);
  //     expect(
  //         wrapper
  //             .find("tbody")
  //             .children()
  //             .find("td")
  //             .at(4)
  //             .children()
  //             .find("input")
  //             .instance().value
  //     ).toMatch(/10/);
  // });
});
