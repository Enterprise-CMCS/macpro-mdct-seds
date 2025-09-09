import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";
import { BrowserRouter } from "react-router-dom";
import { getUserInfo } from "../../utility-functions/userFunctions";

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

const renderComponent = (user, statusId, notApplicable) => {
  getUserInfo.mockResolvedValue({ Items: [user] });
  const initialStore = {
    ...fullStoreMock,
    currentForm: {
      ...fullStoreMock.currentForm,
      statusData: {
        ...fullStoreMock.currentForm.statusData,
        not_applicable: notApplicable,
        status_id: statusId,
      },
    }
  };
  const store = storeFactory(initialStore);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <NotApplicable/>
      </BrowserRouter>
    </Provider>
  );
};

const stateUser = { role: "state" };
const adminUser = { role: "admin" };

describe("NotApplicable", () => {
  it("should be enabled for state users viewing an in-progress form", async () => {
    renderComponent(stateUser, 1, false);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const input = screen.getByTestId("range");
    expect(input).toBeEnabled();
  });

  it("should be disabled for admin users", async () => {
    renderComponent(adminUser, 1, false);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const input = screen.getByTestId("range");
    expect(input).toBeDisabled();
  });

  it("should be disabled for state users viewing a certified form", async () => {
    renderComponent(stateUser, 3, false);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const input = screen.getByTestId("range");
    expect(input).toBeDisabled();
  });

  it("should initialize to Active when applicable", async () => {
    renderComponent(stateUser, 1, false);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const input = screen.getByTestId("range");
    expect(input.value).toBe("0");
  });

  it("should initialize to Not Applicable when appropriate", async () => {
    renderComponent(stateUser, 1, true);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const input = screen.getByTestId("range");
    expect(input.value).toBe("1");
  });
});
