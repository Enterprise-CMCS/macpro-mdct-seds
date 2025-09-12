import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import FormHeader from "./FormHeader";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import currentFormMock_GRE from "../../provider-mocks/currentFormMock_GRE";
import { storeFactory } from "../../provider-mocks/testUtils";

vi.spyOn(window, "alert").mockImplementation();

// The props this component requires in order to render
const defaultProps = {
  quarter: "1",
  form: "21E",
  year: "2021",
  state: "AL",
  formAnswers: [fullStoreMock.currentForm.answers],
  updateFPL: function () {},
  saveForm: function () {}
};

const mockFormTypes = [
  {
    quarter: "1",
    form: "21E",
    year: "2021",
    state: "AL"
  }
];

const mountSetup = (initialState = {}, props = {}, path = "") => {
  const setupProps = { ...defaultProps, ...props };
  const store = storeFactory(initialState);
  return render(
    <BrowserRouter>
      <FormHeader store={store} path={path} {...setupProps} />{" "}
    </BrowserRouter>
  );
};

const mockAnswers = fullStoreMock.currentForm;

vi.mock("../../libs/api", () => ({
  getFormTypes: () => Promise.resolve(mockFormTypes),
  getSingleForm: () => Promise.resolve(mockAnswers)
}));

describe("Test FormHeader.js", () => {
  test("Check for correct state", () => {
    mountSetup(fullStoreMock);
    expect(screen.getByTestId("state-value")).toHaveTextContent("AL");
  });

  test("Check for correct quarter/year", () => {
    mountSetup(fullStoreMock);
    expect(screen.getByTestId("quarter-value")).toHaveTextContent("1/2021");
  });

  test("Hides the FPL when the form is GRE", () => {
    mountSetup(currentFormMock_GRE);
    expect(screen.queryByTestId("form-max-fpl")).not.toBeInTheDocument();
  });
});
