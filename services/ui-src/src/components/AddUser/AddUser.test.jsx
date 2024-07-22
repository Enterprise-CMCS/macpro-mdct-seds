import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import AddUser from "./AddUser";
import stateListMock from "../../provider-mocks/stateListMock";
import { BrowserRouter } from "react-router-dom";

let store;
let wrapper;

const mockStore = configureMockStore([]);

describe("Test AddUser.jsx", () => {
  beforeEach(() => {
    store = mockStore(stateListMock);
    wrapper = render(
      <Provider store={store}>
        <BrowserRouter>
          <AddUser />
        </BrowserRouter>
      </Provider>
    ).container;
  });

  test("Check the main div, with classname AddUser, exists", () => {
    expect(wrapper.querySelector(".page-header")).toBeInTheDocument();
  });

  test("Check the Main component exists", () => {
    expect(wrapper.querySelector(".addUserMain")).toBeInTheDocument();
  });

  test("Check that the User List link is available", () => {
    expect(wrapper.querySelector(".userList")).toBeInTheDocument();
  });

  test("Check the EUA ID input component renders", () => {
    expect(wrapper.querySelector(".eua-ID")).toBeInTheDocument();
  });

  test("Check the Role Selector drop-down renders", () => {
    expect(screen.getByPlaceholderText("Select a Role")).toBeInTheDocument();
  });

  /* Will need to come back to this test as this drop-down is not shown until a Role is selected
   test("Check the State Selector drop-down renders", () => {
        expect(screen.getByPlaceholderText("Select a State")).toBeInTheDocument();
    });
    */

  test("Check the Add User button renders", () => {
    expect(screen.getByText("Add User", { selector: "button"})).toBeInTheDocument();
  });
});
