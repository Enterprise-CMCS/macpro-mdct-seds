import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import FormHeader from "./FormHeader";
import { getSingleForm } from "../../libs/api";
import { useStore } from "../../store/store";

vi.mock("../../libs/api", () => ({
  getSingleForm: vi.fn().mockResolvedValue({
    answers: [
      {
        rows: [
          {
            col6: "% of FPL 301-317",
          },
        ],
      },
    ],
  }),
}));

const renderComponent = (role, form) => {
  const setupProps = {
    state: "AL",
    year: "2021",
    quarter: "1",
    form,
  };
  useStore.setState({ user: { role } });
  return render(
    <BrowserRouter>
      <FormHeader {...setupProps} />
    </BrowserRouter>
  );
};

describe("Test FormHeader.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly", async () => {
    renderComponent("state", "21E");
    await waitFor(() => expect(getSingleForm).toHaveBeenCalled());

    const stateAndQuarter = screen.getByRole("row", {
      name: "State: AL Quarter: 1/2021",
    });
    expect(stateAndQuarter).toBeVisible();

    const fplText = screen.getByText(/What is the upper income .* limit/);
    expect(fplText).toBeVisible();

    const fplButton = screen.getByRole("button", { name: "Apply FPL Changes" });
    expect(fplButton).toBeEnabled();
  });

  it("should disable FPL updates for non-state users", async () => {
    renderComponent("business", "21E");
    await waitFor(() => expect(getSingleForm).toHaveBeenCalled());

    const fplButton = screen.getByRole("button", { name: "Apply FPL Changes" });
    expect(fplButton).toBeDisabled();
  });

  it("should hide the FPL section when the form is GRE", async () => {
    renderComponent("state", "GRE");

    expect(getSingleForm).not.toHaveBeenCalled();
    const fplText = screen.queryByText(/What is the upper income .* limit/);
    expect(fplText).not.toBeInTheDocument();
  });
});
