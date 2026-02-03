import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import SummaryTab from "./SummaryTab";
import currentFormMock_21E from "../../provider-mocks/currentFormMock_21E.js";
import { useStore } from "../../store/store";

vi.mock("../Question/Question", () => ({
  default: (props) => <div>{JSON.stringify(props)}</div>,
}));

vi.mock("../SummaryNotes/SummaryNotes", () => ({
  default: (props) => (
    <div data-testid="summary-notes">{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../SynthesizedGridSummary/SynthesizedGridSummary", () => ({
  default: (props) => <div>{JSON.stringify(props)}</div>,
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useLocation: () => ({
    pathname: "localhost:3000/forms/AL/2021/1/21E",
  }),
}));

const renderComponent = () => {
  useStore.setState(currentFormMock_21E.currentForm);
  return render(
    <BrowserRouter>
      <SummaryTab />
    </BrowserRouter>
  );
};

describe("Test SummaryTab.js", () => {
  it("should render correctly", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Summary:")).toBeInTheDocument();

    const questions = [
      ...container.querySelectorAll(".question-component, .synth-grid-summary"),
    ];

    expect(questions[0].className).toBe("question-component");
    expect(JSON.parse(questions[0].textContent)).toEqual({
      questionID: "summary-2021-21E-01",
      rangeID: "summary",
      questionData: currentFormMock_21E.currentForm.questions[0],
      answerData: currentFormMock_21E.currentForm.questions[0],
      disabled: true,
      synthesized: true,
    });

    expect(questions[1].className).toBe("question-component");
    expect(JSON.parse(questions[1].textContent)).toEqual({
      questionID: "summary-2021-21E-02",
      rangeID: "summary",
      questionData: currentFormMock_21E.currentForm.questions[1],
      answerData: currentFormMock_21E.currentForm.questions[1],
      disabled: true,
      synthesized: true,
    });

    expect(questions[2].className).toBe("question-component");
    expect(JSON.parse(questions[2].textContent)).toEqual({
      questionID: "summary-2021-21E-03",
      rangeID: "summary",
      questionData: currentFormMock_21E.currentForm.questions[2],
      answerData: currentFormMock_21E.currentForm.questions[2],
      disabled: true,
      synthesized: true,
    });

    expect(questions[3].className).toBe("question-component");
    expect(JSON.parse(questions[3].textContent)).toEqual({
      questionID: "summary-2021-21E-04",
      rangeID: "summary",
      questionData: currentFormMock_21E.currentForm.questions[3],
      answerData: currentFormMock_21E.currentForm.questions[3],
      disabled: true,
      synthesized: true,
    });

    expect(questions[4].className).toBe("synth-grid-summary");
    expect(JSON.parse(questions[4].textContent)).toEqual({
      allAnswers: currentFormMock_21E.currentForm.answers,
      questions: currentFormMock_21E.currentForm.questions,
      questionID: "2021-21E-05",
      gridData: currentFormMock_21E.currentForm.answers[4].rows,
      label:
        "What is the average number of months of enrollment for &&&VARIABLE&&& ever enrolled during the quarter?",
    });

    expect(questions[5].className).toBe("question-component");
    expect(JSON.parse(questions[5].textContent)).toEqual({
      questionID: "summary-2021-21E-06",
      rangeID: "summary",
      questionData: currentFormMock_21E.currentForm.questions[5],
      answerData: currentFormMock_21E.currentForm.questions[5],
      disabled: true,
      synthesized: true,
    });
  });
});
