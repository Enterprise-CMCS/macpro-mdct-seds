import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormTemplates from "./FormTemplates";
import { getTemplate, listTemplateYears, updateTemplate } from "../../libs/api";

vi.mock("../../libs/api", () => ({
  getTemplate: vi.fn(),
  listTemplateYears: vi.fn(),
  updateTemplate: vi.fn(),
}));

vi.spyOn(window, "confirm").mockImplementation(() => true);

const mockTemplate = { foo: "bar" };

describe("Tests for FormTemplates.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("Should render correctly when there are no years", async () => {
    listTemplateYears.mockResolvedValue([]);

    render(<FormTemplates />);
    await waitFor(() => expect(listTemplateYears).toHaveBeenCalled());

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
    listTemplateYears.mockResolvedValue([2021, 2022]);
    getTemplate.mockResolvedValue({ template: mockTemplate });

    render(<FormTemplates />);
    await waitFor(() => {
      expect(listTemplateYears).toHaveBeenCalled();
      expect(getTemplate).toHaveBeenCalled();
    });

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    expect(yearDropdown).toHaveValue("2022");

    const templateInput = screen.getByRole("textbox", { name: /Template/ });
    expect(templateInput).toHaveValue(JSON.stringify(mockTemplate, null, 2));

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("Should reset when dropdown is set to + Create New Template", async () => {
    render(<FormTemplates />);
    await waitFor(() => {
      expect(listTemplateYears).toHaveBeenCalled();
      expect(getTemplate).toHaveBeenCalled();
    });

    const templateInput = screen.getByRole("textbox", { name: /Template/ });
    expect(templateInput).toHaveValue(JSON.stringify(mockTemplate, null, 2));

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    userEvent.selectOptions(yearDropdown, "+ Create New Template");

    expect(templateInput).toHaveValue("");
  });

  test("Should send saved templates back to the API", async () => {
    const mockTemplate = { foo: "bar" };
    listTemplateYears.mockResolvedValue([2021, 2022]);
    getTemplate.mockResolvedValue({ template: mockTemplate });

    render(<FormTemplates />);
    await waitFor(() => {
      expect(listTemplateYears).toHaveBeenCalled();
      expect(getTemplate).toHaveBeenCalled();
    });

    userEvent.click(screen.getByText("Save", { selector: "button" }));
    await waitFor(() => {
      expect(updateTemplate).toHaveBeenCalledWith({
        year: 2022,
        template: { ...mockTemplate },
      });
    });
  });

  test("should render an error message when the form has failed to save", async () => {
    updateTemplate.mockRejectedValue(new Error("mock error text"));
    render(<FormTemplates />);
    userEvent.click(screen.getByText("Save", { selector: "button" }));
    await waitFor(() =>
      expect(screen.getByText("Save failed: mock error text")).toBeVisible()
    );
  });
});
