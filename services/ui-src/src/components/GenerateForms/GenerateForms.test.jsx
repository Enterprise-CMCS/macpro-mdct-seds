import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GenerateForms from "./GenerateForms";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generateQuarterlyForms } from "../../libs/api";

vi.spyOn(window, "alert").mockImplementation(() => {});
vi.spyOn(window, "confirm").mockImplementation(() => true);

vi.mock("../../libs/api", () => ({
  generateQuarterlyForms: vi.fn(),
}));

describe("Test GenerateForms.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate forms by sending a request to the API", () => {
    generateQuarterlyForms.mockReturnValue({
      year: 2022,
      quarter: 2,
      status: 200,
      message: "success",
    });

    render(<GenerateForms />);

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    userEvent.selectOptions(yearDropdown, "2022");

    const quarterDropdown = screen.getByRole("combobox", { name: /Quarter/ });
    userEvent.selectOptions(quarterDropdown, "Q2");

    const generateButton = screen.getByRole("button", { name: /Generate/ });
    userEvent.click(generateButton);

    expect(generateQuarterlyForms).toHaveBeenCalledWith({
      year: 2022,
      quarter: 2,
    });
  });

  it("should display an informative error message if the request fails", async () => {
    generateQuarterlyForms.mockRejectedValue(new Error("mock error text"));

    render(<GenerateForms />);

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    userEvent.selectOptions(yearDropdown, "2022");

    const quarterDropdown = screen.getByRole("combobox", { name: /Quarter/ });
    userEvent.selectOptions(quarterDropdown, "Q2");

    const generateButton = screen.getByRole("button", { name: /Generate/ });
    userEvent.click(generateButton);

    await waitFor(() =>
      expect(screen.getByText(/mock error text/)).toBeVisible()
    );
  });
});
