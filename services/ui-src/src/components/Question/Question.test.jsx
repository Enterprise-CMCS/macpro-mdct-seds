import React from "react";
import { describe, expect, it, vi } from "vitest";
import QuestionComponent from "./Question";
import { render, screen } from "@testing-library/react";

vi.mock("../GridWithTotals/GridWithTotals", () => ({
  default: (props) => (<div data-testid="grid-with-totals">{JSON.stringify(props)}</div>)
}));

vi.mock("../GREGridWithTotals/GREGridWithTotals", () => ({
  default: (props) => (<div data-testid="gre-grid-with-totals">{JSON.stringify(props)}</div>)
}));

vi.mock("../SynthesizedGrid/SynthesizedGrid", () => ({
  default: (props) => (<div data-testid="synthesized-grid">{JSON.stringify(props)}</div>)
}));

const mockQuestionData = {
  label: "Mock Question: &&&VARIABLE&&&",
  question: "2021-GRE-01",
  type: "datagridwithtotals",
}

const mockAnswerData = {
  question: "2021-GRE-01",
  rows: [
    { col1: "",      col2: "Column A", col3: "Column B", },
    { col1: "Row 1", col2: null,       col3: null },
    { col1: "Row 2", col2: null,       col3: null },
  ],
  answer_entry: "CO-2021-1-64.21E-0000-01"
}

const defaultProps = {
  questionData: mockQuestionData,
  answerData: mockAnswerData,
  rangeID: "0612",
  disabled: false,
  synthesized: false,
};

describe("Test Question.js", () => {
  it("should render the question label correctly", () => {
    render(<QuestionComponent {...defaultProps} />);
    
    const questionLabel = screen.getByText("1. Mock Question: between the ages of 6 and 12");
    expect(questionLabel).toBeInTheDocument();
  });

  it("should render the default grid correctly", () => {
    render(<QuestionComponent {...defaultProps} />);

    const grid = screen.getByTestId("grid-with-totals");
    expect(grid).toBeInTheDocument();
    
    const gridProps = JSON.parse(grid.textContent);
    expect(gridProps).toEqual({
      questionID: mockAnswerData.answer_entry,
      gridData: mockAnswerData.rows,
      disabled: false,
      synthesized: false,
    });
  });

  it("should disable the default grid when the question is disabled", () => {
    let props = {...defaultProps, disabled: true };

    render(<QuestionComponent {...props} />);

    let grid = screen.getByTestId("grid-with-totals");
    const gridProps = JSON.parse(grid.textContent);
    expect(gridProps.disabled).toBe(true);
  });

  it("should inform the default grid when it is synthesized", () => {
    let props = {...defaultProps, synthesized: true };

    render(<QuestionComponent {...props} />);

    let grid = screen.getByTestId("grid-with-totals");
    const gridProps = JSON.parse(grid.textContent);
    expect(gridProps.synthesized).toBe(true);
  });

  it("should render the GRE grid correctly", () => {
    const props = {
      ...defaultProps,
      questionData: {
        ...defaultProps.questionData,
        type: "gregridwithtotals",
      },
    }
    render(<QuestionComponent {...props} />);

    const grid = screen.getByTestId("gre-grid-with-totals");
    expect(grid).toBeInTheDocument();
    
    const gridProps = JSON.parse(grid.textContent);
    expect(gridProps).toEqual({
      questionID: mockAnswerData.answer_entry,
      gridData: mockAnswerData.rows,
      disabled: false,
    });
  });

  it("should disable the GRE grid when the question is disabled", () => {
    let props = {
      ...defaultProps,
      questionData: {
        ...defaultProps.questionData,
        type: "gregridwithtotals",
      },
      disabled: true,
    };

    render(<QuestionComponent {...props} />);
    
    let grid = screen.getByTestId("gre-grid-with-totals");
    const gridProps = JSON.parse(grid.textContent);
    expect(gridProps.disabled).toBe(true);
  });

  it("should render the synthesized grid correctly", () => {
    const props = {
      ...defaultProps,
      questionData: {
        ...defaultProps.questionData,
        // Question 5 is always a SynthesizedGrid
        question: "2021-64.21E-05",
      },
    }
    render(<QuestionComponent {...props} />);

    const questionLabel = screen.getByText("5. Mock Question: between the ages of 6 and 12");
    expect(questionLabel).toBeInTheDocument();

    const grid = screen.getByTestId("synthesized-grid");
    expect(grid).toBeInTheDocument();
    
    const gridProps = JSON.parse(grid.textContent);
    expect(gridProps).toEqual({
      questionID: mockAnswerData.answer_entry,
      gridData: mockAnswerData.rows,
    });
  });
});
