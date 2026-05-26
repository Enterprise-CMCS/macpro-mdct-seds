import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeState from "./HomeState";
import { BrowserRouter, useNavigate } from "react-router";
import { render, screen, waitFor } from "@testing-library/react";
import { listFormsForState as actualListFormsForState } from "../../libs/api";
import { useStore } from "../../store/store";

vi.mock("../../libs/api", () => ({
  listFormsForState: vi.fn(),
}));
const listFormsForState = vi.mocked(actualListFormsForState);

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
}));
const mockNavigate = useNavigate();

const renderComponent = (state = undefined) => {
  const user = { state };
  useStore.setState({ user });
  return render(
    <BrowserRouter>
      <HomeState />
    </BrowserRouter>
  );
};

describe("Test HomeState.js", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should redirect users with no state", async () => {
    renderComponent();

    expect(mockNavigate).toHaveBeenCalledWith("/register-state");
  });

  it("should display links to quarterly reports", async () => {
    listFormsForState.mockResolvedValue([
      { year: 2021, quarter: 3 },
      { year: 2021, quarter: 4 },
      { year: 2022, quarter: 1 },
    ]);

    const { container } = renderComponent("CO");
    await waitFor(() => {
      expect(listFormsForState).toHaveBeenCalledWith("CO");
    });

    const expectedUrls = [
      "/forms/CO/2021/3",
      "/forms/CO/2021/4",
      "/forms/CO/2022/1",
    ];
    for (let url of expectedUrls) {
      expect(container.querySelector(`a[href='${url}']`)).toBeInTheDocument();
    }
  });

  it("should still render if listFormsForState fails", async () => {
    listFormsForState.mockRejectedValueOnce(new Error("Mock server error"));

    // Swallow this error (but only this error)
    const spy = vi.spyOn(console, "log").mockImplementation((arg) => {
      if (!(arg instanceof Error) || arg.message !== "Mock server error") {
        throw new Error(arg);
      }
    });

    renderComponent("CO");
    await waitFor(() => expect(listFormsForState).toHaveBeenCalled());

    spy.mockRestore();
    expect(screen.getByText(/Welcome to SEDS/)).toBeVisible();
  });
});
