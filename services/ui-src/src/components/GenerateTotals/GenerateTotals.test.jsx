import React from "react";
import GenerateTotals from "./GenerateTotals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generateEnrollmentTotals } from "../../libs/api";

jest.spyOn(window, "confirm").mockImplementation(() => true);

jest.mock("../../libs/api", () => ({
  generateEnrollmentTotals: jest.fn(),
}));

describe("Test GenerateTotals.js", () => {
  let container;
  beforeEach(() => {
    container = render(<GenerateTotals/>).container;
    jest.clearAllMocks();
  });

  it("should send a request to the API, and display a success message", async () => {
    const submitButton = screen.getByText("Generate Enrollment Totals", { selector: "button" });
    userEvent.click(submitButton);
    
    await waitFor(() => expect(generateEnrollmentTotals).toHaveBeenCalled());

    expect(screen.getByText(/Enrollment Totals have been requested.*Please wait/)).toBeInTheDocument();
  });
});
