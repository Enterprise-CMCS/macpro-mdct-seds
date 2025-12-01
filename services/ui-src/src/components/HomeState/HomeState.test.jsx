import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeState from "./HomeState";
import { BrowserRouter, useHistory } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { obtainAvailableForms } from "../../libs/api";

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

vi.mock("../../libs/api", () => ({
  obtainAvailableForms: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useHistory: vi.fn(),
}));

const renderComponent = (...userStates) => {
  const user = {
    attributes: {
      "app-role": "state",
    },
    states: userStates,
  };
  getUserInfo.mockResolvedValue({ Items: [user] });
  return render(
    <BrowserRouter>
      <HomeState user={user}/>
    </BrowserRouter>
  );
}

describe("Test HomeState.js", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should redirect users with no state", async () => {
    const history = [];
    useHistory.mockReturnValue(history);
    
    renderComponent();
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    expect(history).toEqual(["/register-state"]);
  });

  it("should display links to quarterly reports", async () => {
    obtainAvailableForms.mockResolvedValue([
      { year: 2021, quarter: 3 },
      { year: 2021, quarter: 4 },
      { year: 2022, quarter: 1 },
    ]);

    const { container } = renderComponent("CO");
    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalled();
      expect(obtainAvailableForms).toHaveBeenCalledWith({ stateId: "CO" });
    });

    const expectedUrls = [
      "/forms/CO/2021/3",
      "/forms/CO/2021/4",
      "/forms/CO/2022/1",
    ]
    for (let url of expectedUrls) {
      expect(container.querySelector(`a[href='${url}']`)).toBeInTheDocument();
    }
  });
});
