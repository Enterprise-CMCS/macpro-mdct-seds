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

  it("should not generate forms if the user has not selected a year and quarter", () => {
    render(<GenerateForms />);

    const generateButton = screen.getByRole("button", { name: /Generate/ });
    userEvent.click(generateButton);

    expect(window.alert).toBeCalledWith("Please select a Year and Quarter");
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

  it("should display an informative warning message if the request fails", async () => {
    const warnText = "some warning message directly from the API";
    generateQuarterlyForms.mockReturnValue({ status: 204, message: warnText });

    render(<GenerateForms />);

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    userEvent.selectOptions(yearDropdown, "2022");

    const quarterDropdown = screen.getByRole("combobox", { name: /Quarter/ });
    userEvent.selectOptions(quarterDropdown, "Q2");

    const generateButton = screen.getByRole("button", { name: /Generate/ });
    userEvent.click(generateButton);

    await waitFor(() => expect(screen.getByText(warnText)).toBeVisible());
  });

  it("should display an informative error message if the request fails", async () => {
    const errorText = "some error message directly from the API";
    generateQuarterlyForms.mockReturnValue({ status: 500, message: errorText });

    render(<GenerateForms />);

    const yearDropdown = screen.getByRole("combobox", { name: /Year/ });
    userEvent.selectOptions(yearDropdown, "2022");

    const quarterDropdown = screen.getByRole("combobox", { name: /Quarter/ });
    userEvent.selectOptions(quarterDropdown, "Q2");

    const generateButton = screen.getByRole("button", { name: /Generate/ });
    userEvent.click(generateButton);

    await waitFor(() => expect(screen.getByText(errorText)).toBeVisible());
  });
});
