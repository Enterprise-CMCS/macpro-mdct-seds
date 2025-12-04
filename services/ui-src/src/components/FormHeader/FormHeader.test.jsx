import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import FormHeader from "./FormHeader";
import fullStoreMock from "../../provider-mocks/fullStoreMock";

vi.spyOn(window, "alert").mockImplementation();

const mountSetup = (props) => {
  const setupProps = {
    quarter: "1",
    form: "21E",
    year: "2021",
    state: "AL",
    ...props,
  };
  return render(
    <BrowserRouter>
      <FormHeader {...setupProps} />{" "}
    </BrowserRouter>
  );
};

const mockAnswers = fullStoreMock.currentForm;

vi.mock("../../libs/api", () => ({
  getSingleForm: () => Promise.resolve(mockAnswers)
}));

describe("Test FormHeader.js", () => {
  test("Check for correct state", () => {
    mountSetup();
    expect(screen.getByTestId("state-value")).toHaveTextContent("AL");
  });

  test("Check for correct quarter/year", () => {
    mountSetup();
    expect(screen.getByTestId("quarter-value")).toHaveTextContent("1/2021");
  });

  test("Hides the FPL when the form is GRE", () => {
    mountSetup();
    expect(screen.queryByTestId("form-max-fpl")).not.toBeInTheDocument();
  });
});
