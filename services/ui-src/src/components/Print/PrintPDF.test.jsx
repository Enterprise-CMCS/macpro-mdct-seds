import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import PrintPDF from "./PrintPDF";
import { getAgeRangeDetails } from "../../lookups/ageRanges";
import { useStore } from "../../store/store";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn().mockReturnValue({
    state: "AL",
    year: "2021",
    quarter: "01",
    formName: "21E",
  }),
}));

const renderComponent = () => {
  useStore.setState({
    ...fullStoreMock.currentForm,
    user: { role: "state", state: "AL" },
    loadForm: vi.fn(),
  });
  return render(
    <BrowserRouter>
      <PrintPDF />
    </BrowserRouter>
  );
};

describe("PrintPDF component", () => {
  it("should render appropriate sub-components", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const breadcrumbs = container.querySelectorAll(".breadcrumbs a");
    const expectedHrefs = ["/", "/forms/AL/2021/01", "/forms/AL/2021/01/21E"];
    expect(breadcrumbs.length).toBe(expectedHrefs.length);
    for (let i = 0; i < expectedHrefs.length; i += 1) {
      expect(breadcrumbs[i].href).toMatch(new RegExp(expectedHrefs[i] + "$"));
    }

    const printButton = screen.getByText("Print / PDF", { selector: "button" });
    expect(printButton).toBeInTheDocument();

    const headers = screen.getAllByText("Form 21E | AL | 2021 | Quarter 01", {
      selector: "h2",
    });
    expect(headers.length).toBe(2);

    const allAgeDescriptions = fullStoreMock.currentForm.answers
      .map((ans) => ans.rangeId)
      .filter((x, i, a) => i === a.indexOf(x))
      .map((rangeId) => getAgeRangeDetails(rangeId).description);

    for (let ageRangeDescription of allAgeDescriptions) {
      const sectionHeader = screen.getByText(ageRangeDescription, {
        exact: false,
        selector: "h3",
      });
      expect(sectionHeader).toBeInTheDocument();
    }
  });
});
