import React from "react";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
import GenerateForms from "./GenerateForms";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generateQuarterlyForms } from "../../libs/api";

vi.spyOn(window, "alert").mockImplementation(() => {});
vi.spyOn(window, "confirm").mockImplementation(() => true);

vi.mock("../../libs/api", () => ({
  generateQuarterlyForms: vi.fn()
}));

describe("Test GenerateForms.js", () => {
  let container;
  beforeEach(() => {
    container = render(<GenerateForms />).container;
    vi.clearAllMocks();
  });

  it("should render", () => {
    // A dropdown for year, and a dropdown for quarter
    expect(container.querySelectorAll(".Dropdown-root")).toHaveLength(2);
    expect(
      screen.getByText("Generate Forms", { selector: "button" })
    ).toBeInTheDocument();
  });

  test("Generating Forms should error if the user has not selected a year and quarter", () => {
    expect(window.alert).not.toHaveBeenCalled();

    const generateButton = screen.getByText("Generate Forms", {
      selector: "button"
    });
    userEvent.click(generateButton);

    expect(window.alert).toBeCalledWith("Please select a Year and Quarter");
  });

  test("Generating Forms should send a request to the API", () => {
    expect(generateQuarterlyForms).not.toHaveBeenCalled();

    const yearDropdown = screen.getByText("Select a Year");
    userEvent.click(yearDropdown);
    const yearOption = screen.getByText("2022");
    userEvent.click(yearOption);

    const quarterDropdown = screen.getByText("Select a Quarter");
    userEvent.click(quarterDropdown);
    const quarterOption = screen.getByText("Q2");
    userEvent.click(quarterOption);

    const generateButton = screen.getByText("Generate Forms", {
      selector: "button"
    });
    userEvent.click(generateButton);

    expect(generateQuarterlyForms).toHaveBeenCalledWith({
      year: 2022,
      quarter: 2
    });
  });
});
