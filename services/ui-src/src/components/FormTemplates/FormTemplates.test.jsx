import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormTemplates from "./FormTemplates";
import {
  obtainFormTemplate,
  obtainFormTemplateYears,
  updateCreateFormTemplate
} from "../../libs/api";
import { act } from "react-dom/test-utils";

jest.mock("../../libs/api", () => ({
  obtainFormTemplate: jest.fn(),
  obtainFormTemplateYears: jest.fn(),
  updateCreateFormTemplate: jest.fn(),
}));

jest.spyOn(window, "confirm").mockImplementation(() => true);

describe("Tests for FormTemplates.js", () => {
  test("Should render correctly when there are no years", async () => {
    obtainFormTemplateYears.mockResolvedValue([]);
    
    render(<FormTemplates />);
    await waitFor(() => expect(obtainFormTemplateYears).toHaveBeenCalled());

    expect(screen.getByLabelText("Enter Year")).toBeInTheDocument();
    expect(screen.getByLabelText("Enter Year")).toHaveValue(new Date().getFullYear() + 1);
    expect(screen.getByLabelText("Enter or Modify Template")).toBeInTheDocument();
    expect(screen.getByText("Save", { selector: "button" })).toBeInTheDocument();
  });

  test("Should render correctly when years exist", async () => {
    const mockTemplate = { foo: "bar" };
    obtainFormTemplateYears.mockResolvedValue([2021, 2022]);
    obtainFormTemplate.mockResolvedValue([{ template: mockTemplate }]);

    const { container } = render(<FormTemplates/>);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled()
      expect(obtainFormTemplate).toHaveBeenCalled()
    });

    const yearSelection = container.querySelector(".Dropdown-root.year-select-list .is-selected");
    expect(yearSelection).toHaveTextContent("2021");

    const templateInput = screen.getByLabelText("Enter or Modify Template");
    expect(JSON.parse(templateInput.value)).toEqual(mockTemplate);

    expect(screen.getByText("Save", { selector: "button" })).toBeInTheDocument();
  });

  test("Should send saved templates back to the API", async () => {
    const mockTemplate = { foo: "bar" };
    obtainFormTemplateYears.mockResolvedValue([2021, 2022]);
    obtainFormTemplate.mockResolvedValue([{ template: mockTemplate }]);

    render(<FormTemplates/>);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled()
      expect(obtainFormTemplate).toHaveBeenCalled()
    });

    userEvent.click(screen.getByText("Save", { selector: "button" }));
    await waitFor(() => {
      expect(updateCreateFormTemplate).toHaveBeenCalledWith({
        year: 2021,
        template: {...mockTemplate},
      });
    });
  });
});
