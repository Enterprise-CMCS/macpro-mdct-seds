import React from "react";
import {mount} from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import NotFound from "./NotFound";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";

const mockStore = configureStore([]);

describe("Test NotFound.js", () => {
    let store;
    let wrapper;

    beforeEach(() => {
        store = mockStore(currentFormMock_21E);
        wrapper = mount(
            <Provider store={store}>
                <NotFound />
            </Provider>
        );
    });

    test("Check the main div, with classname NotFound exists", () => {
        expect(wrapper.find(".NotFound").length).toBe(1);
    });
});
