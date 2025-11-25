import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import FormFooter from "./FormFooter";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import configureMockStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";

const mockStore = configureMockStore([]);

const mockUser = {
  Items: [
    {
      status: "success",
      email: "email@email.com",
      name: "Test User",
      states: ["CA"],
      role: "state"
    }
  ]
};

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: () => Promise.resolve(mockUser)
}));

describe("Test FormFooter.js", () => {
  beforeEach(() => {
    const store = mockStore(fullStoreMock);
    render(
      <Provider store={store}>
        <BrowserRouter>
          <FormFooter state="AL" year="2021" quarter="1" />
        </BrowserRouter>
      </Provider>
    );
  });

  test("Check for Link back to Quarter Page list of available reports", () => {
    expect(screen.getByText("Back to Q1 2021")).toBeInTheDocument();
  });

  test("Check for Last Saved Date display", () => {
    expect(screen.getByTestId("lastModified"))
      .toHaveTextContent("Last saved: 4/14/2021 at 8:46:35 AM EDT");
  });

  test("Check for Save button", () => {
    const saveButton = screen.getByText("Save", { selector: "button" })
    expect(saveButton).toBeInTheDocument();
  });
});
