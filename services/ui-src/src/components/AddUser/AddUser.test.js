import React, { useState }from "react";
import {shallow} from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import AddUser from "./AddUser.js";

let wrapper;

const mockStore = configureMockStore();
const store = mockStore({});

// *** set up mocks
beforeEach(() => {
    wrapper = shallow (<AddUser store={store} />);
});

describe("Test AddUser.js", () => {
    test("Check the main element, with classname AddUser, exists", () => {
        expect(wrapper.find(".AddUser").length).toBe(1);
    });
});
