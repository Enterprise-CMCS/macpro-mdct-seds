import React from "react";
import { mount } from "enzyme";
import GREGridWithTotals from "./GREGridWithTotals";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import currentFormMock_GRE from "../../provider-mocks/currentFormMock_GRE.js";
const mockStore = configureStore([]);

describe("Test GREGridWithTotals.js", () => {
    let store;
    let wrapper;
    const gridDataItems = [
        {
            "col1": "",
            "col2": "21E Enrolled",
            "col3": "64.21E Enrolled",
            "col4": "Total CHIP Enrolled",
            "col5": "64.EC Enrolled",
            "col6": "21PW Enrolled"
        },
        {
            "col1": "1. Female",
            "col2": 10,
            "col3": 15,
            "col4": null,
            "col5": 20,
            "col6": 25
        },
        {
            "col1": "2. Male",
            "col2": 30,
            "col3": 35,
            "col4": null,
            "col5": 40,
            "col6": 45
        },
        {
            "col1": "3. Unspecified Gender",
            "col2": 50,
            "col3": 55,
            "col4": null,
            "col5": 60,
            "col6": 65
        }
    ];

    beforeEach(() => {
        store = mockStore(currentFormMock_GRE);
        wrapper = mount(
            <Provider store={store}>
                <GREGridWithTotals gridData={gridDataItems} />
            </Provider>
        );
    });

    test("Check the main div, with classname app, exists", () => {
        expect(wrapper.find(".gre-grid-with-totals").length).toBe(1);
    });

    test("Check for all top headers", () => {
        expect(wrapper.text()).toMatch(/21E Enrolled/);
        expect(wrapper.text()).toMatch(/64.21E Enrolled/);
        expect(wrapper.text()).toMatch(/Total CHIP Enrolled/);
        expect(wrapper.text()).toMatch(/64.EC Enrolled/);
        expect(wrapper.text()).toMatch(/21PW Enrolled/);
    });

    test("Check for all side headers", () => {
        expect(wrapper.text()).toMatch(/1. Female/);
        expect(wrapper.text()).toMatch(/2. Male/);
        expect(wrapper.text()).toMatch(/3. Unspecified Gender/);
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
        ).toMatch(/10/);

        expect(
            wrapper
                .find("tbody")
                .children()
                .find("td")
                .at(1)
                .children()
                .find("input")
                .instance().value
        ).toMatch(/15/);

        /*expect(
            wrapper
                .find("tbody")
                .children()
                .find("td")
                .at(2)
                .children()
                .find("input")
                .instance().value
        ).toMatch(/3/);*/

        expect(
            wrapper
                .find("tbody")
                .children()
                .find("td")
                .at(3)
                .children()
                .find("input")
                .instance().value
        ).toMatch(/20/);
        expect(
            wrapper
                .find("tbody")
                .children()
                .find("td")
                .at(4)
                .children()
                .find("input")
                .instance().value
        ).toMatch(/25/);
    });

    test("Check table output values after addition occurs", () => {
        expect(
            wrapper.find(".total-row").children().find("td").at(0).text()
        ).toMatch(/90/);
        expect(
            wrapper.find(".total-row").children().find("td").at(1).text()
        ).toMatch(/105/);
        expect(
            wrapper.find(".total-row").children().find("td").at(2).text()
        ).toMatch(/195/);
        expect(
            wrapper.find(".total-row").children().find("td").at(3).text()
        ).toMatch(/120/);
        expect(
            wrapper.find(".total-row").children().find("td").at(4).text()
        ).toMatch(/135/);
        expect(
            wrapper.find(".total-row").children().find("td").at(5).text()
        ).toMatch(/450/);
    });
});
