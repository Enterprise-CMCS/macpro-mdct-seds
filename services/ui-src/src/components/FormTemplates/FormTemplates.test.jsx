import React from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormTemplates from "./FormTemplates";
import {
  obtainFormTemplate,
  obtainFormTemplateYears,
  updateCreateFormTemplate
} from "../../libs/api";

vi.mock("../../libs/api", () => ({
  obtainFormTemplate: vi.fn(),
  obtainFormTemplateYears: vi.fn(),
  updateCreateFormTemplate: vi.fn()
}));

vi.spyOn(window, "confirm").mockImplementation(() => true);

describe("Tests for FormTemplates.js", () => {
  test("Should render correctly when there are no years", async () => {
    obtainFormTemplateYears.mockResolvedValue([]);

    render(<FormTemplates />);
    await waitFor(() => expect(obtainFormTemplateYears).toHaveBeenCalled());

    expect(screen.getByLabelText("Enter Year")).toBeInTheDocument();
    expect(screen.getByLabelText("Enter Year")).toHaveValue(
      new Date().getFullYear() + 1
    );
    expect(
      screen.getByLabelText("Enter or Modify Template")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Save", { selector: "button" })
    ).toBeInTheDocument();
  });

  test("Should render correctly when years exist", async () => {
    const mockTemplate = { foo: "bar" };
    obtainFormTemplateYears.mockResolvedValue([2021, 2022]);
    obtainFormTemplate.mockResolvedValue([{ template: mockTemplate }]);

    const { container } = render(<FormTemplates />);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled();
      expect(obtainFormTemplate).toHaveBeenCalled();
    });

    const yearSelection = container.querySelector(
      ".Dropdown-root.year-select-list .is-selected"
    );
    expect(yearSelection).toHaveTextContent("2021");

    const templateInput = screen.getByLabelText("Enter or Modify Template");
    expect(JSON.parse(templateInput.value)).toEqual(mockTemplate);

    expect(
      screen.getByText("Save", { selector: "button" })
    ).toBeInTheDocument();
  });

  test("Should reset when dropdown is set to + Create New Template", async () => {
    render(<FormTemplates />);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled();
      expect(obtainFormTemplate).toHaveBeenCalled();
    });

    screen.debug();

    const textarea = screen.getByRole("textbox", {
      name: "Enter or Modify Template"
    });
    expect(textarea.value).toEqual('{\n  "foo": "bar"\n}');

    const yearDropdown = screen.getByText("2021");
    userEvent.click(yearDropdown);

    const yearOption = screen.getByText("+ Create New Template");
    userEvent.click(yearOption);
    expect(textarea.value).toEqual("");
  });

  test("Should send saved templates back to the API", async () => {
    const mockTemplate = { foo: "bar" };
    obtainFormTemplateYears.mockResolvedValue([2021, 2022]);
    obtainFormTemplate.mockResolvedValue([{ template: mockTemplate }]);

    updateCreateFormTemplate.mockResolvedValue({
      year: 2021,
      template: { ...mockTemplate },
      message: "create form template is successful"
    });
    render(<FormTemplates />);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled();
      expect(obtainFormTemplate).toHaveBeenCalled();
    });

    userEvent.click(screen.getByText("Save", { selector: "button" }));
    await waitFor(() => {
      expect(updateCreateFormTemplate).toHaveBeenCalledWith({
        year: 2021,
        template: { ...mockTemplate }
      });
    });
  });

  test("should render an error message when the form has failed to save", async () => {
    updateCreateFormTemplate.mockRejectedValue(
      new Error("Failed to fetch public IP. Error thrown from Vitest")
    );
    render(<FormTemplates />);
    userEvent.click(screen.getByText("Save", { selector: "button" }));
    await waitFor(() =>
      screen.getByText(
        "Unable to save. Please verify that the template contains valid JSON"
      )
    );
  });
});
