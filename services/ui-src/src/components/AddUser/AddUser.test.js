import React, { useState }from "react";
import {mount, shallow} from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import AddUser from "./AddUser.js";
import stateListMock from "../../provider-mocks/stateListMock"

let store;
let wrapper;

const mockStore = configureMockStore([]);

describe("Test AddUser.js", () => {
    beforeEach(() => {
        store = mockStore(stateListMock);
        wrapper = mount(
            <Provider store={store}>
                <AddUser />
            </Provider>
        );
    });

    test("Check the main div, with classname AddUser, exists", () => {
        expect(wrapper.find(".page-header").length).toBe(1);
    });
});
