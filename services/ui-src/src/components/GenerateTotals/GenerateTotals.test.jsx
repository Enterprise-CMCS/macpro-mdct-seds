import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GenerateTotals from "./GenerateTotals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { generateEnrollmentTotals } from "../../libs/api";

vi.spyOn(window, "confirm").mockImplementation(() => true);

vi.mock("../../libs/api", () => ({
  generateEnrollmentTotals: vi.fn(),
}));

describe("Test GenerateTotals.js", () => {
  let container;
  beforeEach(() => {
    container = render(<GenerateTotals/>).container;
    vi.clearAllMocks();
  });

  it("should send a request to the API, and display a success message", async () => {
    const submitButton = screen.getByText("Generate Enrollment Totals", { selector: "button" });
    userEvent.click(submitButton);
    
    await waitFor(() => expect(generateEnrollmentTotals).toHaveBeenCalled());

    expect(screen.getByText(/Enrollment Totals have been requested.*Please wait/)).toBeInTheDocument();
  });
});
