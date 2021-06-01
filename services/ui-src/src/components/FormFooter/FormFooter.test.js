import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import FormFooter from "./FormFooter";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import configureMockStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";

const mockStore = configureMockStore([]);

describe("Test FormFooter.js - Mount", () => {
  let wrapper;

  let store;

  beforeEach(() => {
    store = mockStore(fullStoreMock);

    wrapper = mount(
      <Provider store={store}>
        <BrowserRouter>
          <FormFooter state="AL" year="2021" quarter="1" />
        </BrowserRouter>
      </Provider>
    );
  });

  test("Check the form footer div exists", () => {
    expect(wrapper.find(".formfooter").length).toBe(1);
  });

  test("Check for Link back to Quarter Page list of available reports", () => {
    expect(wrapper.find(".form-nav").length).toBe(2);
  });

  test("Check for Last Saved Date display", () => {
    expect(wrapper.find(".form-actions").length).toBe(2);
  });

  test("Check for Save button", () => {
    expect(wrapper.find({ "data-testid": "saveButton" }).length).toBe(2);
  });

  test("Check for last modified button", () => {
    expect(wrapper.find({ "data-testid": "lastModified" }).length).toBe(2);
  });

  test("Check for correct time and date", () => {
    expect(wrapper.find(`[data-testid="lastModified"]`).at(0).text()).toBe(
      " Last saved: 04-14-2021 at 8:46:35 am EST "
    );
  });
});
