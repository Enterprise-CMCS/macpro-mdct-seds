import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeState from "./HomeState";
import { BrowserRouter, useHistory } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { listFormsForState } from "../../libs/api";
import { useStore } from "../../store/store";

vi.mock("../../libs/api", () => ({
  listFormsForState: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useHistory: vi.fn(),
}));

const renderComponent = (state) => {
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
    const history = [];
    useHistory.mockReturnValue(history);

    renderComponent();

    expect(history).toEqual(["/register-state"]);
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

    renderComponent("CO");
    await waitFor(() => expect(listFormsForState).toHaveBeenCalled());

    expect(screen.getByText(/Welcome to SEDS/)).toBeVisible();
  });
});
