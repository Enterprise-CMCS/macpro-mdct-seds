import React from "react";
import App from "./App";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

let store;
const mockStore = configureMockStore([]);
store = mockStore();

describe("Test App.js", () => {
  test("Check the main div, with classname app, exists", () => {
    const wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(wrapper.find(".App").length).toBe(1);
  });
});
