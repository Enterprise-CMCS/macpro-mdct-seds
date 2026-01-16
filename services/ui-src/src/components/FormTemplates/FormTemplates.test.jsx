import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormTemplates from "./FormTemplates";
import {
  obtainFormTemplate,
  obtainFormTemplateYears,
  updateCreateFormTemplate,
} from "../../libs/api";

vi.mock("../../libs/api", () => ({
  obtainFormTemplate: vi.fn(),
  obtainFormTemplateYears: vi.fn(),
  updateCreateFormTemplate: vi.fn(),
}));

vi.spyOn(window, "confirm").mockImplementation(() => true);

const mockTemplate = { foo: "bar" };

describe("Tests for FormTemplates.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    obtainFormTemplateYears.mockResolvedValue([2021, 2022]);
    obtainFormTemplate.mockResolvedValue([{ template: mockTemplate }]);

    render(<FormTemplates />);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled();
      expect(obtainFormTemplate).toHaveBeenCalled();
    });

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    expect(yearDropdown).toHaveValue("2021");

    const templateInput = screen.getByRole("textbox", { name: /Template/ });
    expect(templateInput).toHaveValue(JSON.stringify(mockTemplate, null, 2));

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("Should reset when dropdown is set to + Create New Template", async () => {
    render(<FormTemplates />);
    await waitFor(() => {
      expect(obtainFormTemplateYears).toHaveBeenCalled();
      expect(obtainFormTemplate).toHaveBeenCalled();
    });

    const templateInput = screen.getByRole("textbox", { name: /Template/ });
    expect(templateInput).toHaveValue(JSON.stringify(mockTemplate, null, 2));

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    userEvent.selectOptions(yearDropdown, "+ Create New Template");

    expect(templateInput).toHaveValue("");
  });

  test("Should send saved templates back to the API", async () => {
    const mockTemplate = { foo: "bar" };
    obtainFormTemplateYears.mockResolvedValue([2021, 2022]);
    obtainFormTemplate.mockResolvedValue([{ template: mockTemplate }]);

    updateCreateFormTemplate.mockResolvedValue({
      year: 2021,
      template: { ...mockTemplate },
      message: "create form template is successful",
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
        template: { ...mockTemplate },
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
