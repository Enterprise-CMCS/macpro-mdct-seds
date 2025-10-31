import React from "react";
import { describe, expect, it, vi } from "vitest";
import SynthesizedGridSummary from "./SynthesizedGridSummary";
import { render, screen } from "@testing-library/react";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";

vi.mock("../GridWithTotals/GridWithTotals", () => ({
  default: props => (
    <div data-testid="grid-with-totals">{JSON.stringify(props)}</div>
  )
}));

const renderComponent = () => {
  return render(
    <SynthesizedGridSummary
      questions={currentFormMock_21E.currentForm.questions}
      allAnswers={currentFormMock_21E.currentForm.answers}
      questionID="2021-21E-05"
      gridData={currentFormMock_21E.currentForm.answers[4].rows}
      label="What is the average number of months of enrollment for &&&VARIABLE&&& ever enrolled during the quarter?"
    />
  );
};

describe("Test SynthesizedGridSummary.js", () => {
  it("should render sub-components", () => {
    renderComponent();

    const label = screen.getByTestId("synthesized-summary-label");
    expect(label).toHaveTextContent(
      "5. What is the average number of months of enrollment for of all ages ever enrolled during the quarter?"
    );

    const grid = screen.getByTestId("grid-with-totals");
    expect(grid).toBeInTheDocument();

    const disclaimer = screen.getByTestId("synthesized-disclaimer");
    expect(disclaimer).toHaveTextContent(
      "Values will not appear until source data is provided"
    );
  });

  it.skip("should calculate synthesized values correctly", () => {
    // TODO. These calculations are complicated.
  });
});
