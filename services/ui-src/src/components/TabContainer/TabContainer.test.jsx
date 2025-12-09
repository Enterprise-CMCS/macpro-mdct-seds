import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TabContainer from "./TabContainer";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { useStore } from "../../store/store";

vi.mock("../Question/Question", () => ({
  default: (props) => (<div className="question-component">{JSON.stringify(props)}</div>)
}));

vi.mock("../SummaryTab/SummaryTab", () => ({
  default: (props) => (<div data-testid="summary-tab">{JSON.stringify(props)}</div>)
}));

vi.mock("../CertificationTab/CertificationTab", () => ({
  default: (props) => (<div data-testid="certification-tab">{JSON.stringify(props)}</div>)
}));

const renderComponent = (userRole) => {
  useStore.setState({
    ...fullStoreMock.currentForm,
    user: { role: userRole },
  });
  return render(<TabContainer/>);
};

describe("TabContainer tests", () => {
  it("should render the correct subcomponents", async () => {
    const { container } = renderComponent("state");

    const firstQuestion = container.querySelector(".question-component");
    const firstQuestionProps = JSON.parse(firstQuestion.textContent);
    expect(firstQuestionProps.disabled).toBe(false);

    userEvent.click(screen.getAllByRole("tab")[5]);
    expect(screen.getByTestId("summary-tab")).toBeInTheDocument();

    userEvent.click(screen.getAllByRole("tab")[6]);
    expect(screen.getByTestId("certification-tab")).toBeInTheDocument();
  });

  it("should disable questions for admin users", async () => {
    const { container } = renderComponent("admin");

    const firstQuestion = container.querySelector(".question-component");
    const firstQuestionProps = JSON.parse(firstQuestion.textContent);
    expect(firstQuestionProps.disabled).toBe(true);
  });

  it("should render the correct tab names", async () => {
    renderComponent("state");

    const expectedTabNames = [
      "Under Age 0",
      "Ages 0 - 1",
      "Ages 1 - 5",
      "Ages 6 - 12",
      "Ages 13 - 18",
      "Summary",
      "Certification",
    ];
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBe(expectedTabNames.length);
    for (let i = 0; i < expectedTabNames.length; i += 1) {
      expect(tabs[i].textContent).toBe(expectedTabNames[i]);
    }
  });

  it("should render the correct headings within tabs", async () => {
    renderComponent("state");

    const expectedTabHeaders = [
      "Conception to birth:",
      "Birth through age 12 months:",
      "Age 1 year through age 5 years:",
      "Age 6 years through age 12 years:",
      "Age 13 years through age 18 years:",
      // Note that the summary and certification tabs do not contain h3s
    ];
    const tabs = screen.getAllByRole("tab");
    for (let i = 0; i < expectedTabHeaders.length; i += 1) {
      userEvent.click(tabs[i]);
      expect(screen.getByText(expectedTabHeaders[i])).toBeInTheDocument();
    }
  });

  it("should render the correct content within tabs", async () => {
    const { container } = renderComponent("state");

    // All five age group tabs should containe six questions each
    const tabs = screen.getAllByRole("tab");
    for (let i = 0; i < 5; i += 1) {
      userEvent.click(tabs[i]);
      const questions = container.querySelectorAll(".question-component");
      expect(questions.length).toBe(6)
    }
  });
});
