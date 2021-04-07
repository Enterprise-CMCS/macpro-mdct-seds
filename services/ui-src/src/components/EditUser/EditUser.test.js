import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import EditUser from "./EditUser.js";
import stateListMock from "../../provider-mocks/stateListMock";

let store;
let wrapper;

const mockStore = configureMockStore([]);

describe("Test AddUser.js", () => {
    beforeEach(() => {
        store = mockStore(stateListMock);
        wrapper = mount(
            <Provider store={store}>
                <EditUser />
            </Provider>
        );
    });

    test("Check the main div, with classname edit-user, exists", () => {
        expect(wrapper.find(".edit-user").length).toBe(1);
    });

});