import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";
import { BrowserRouter } from "react-router-dom";
import { getUserInfo } from "../../utility-functions/userFunctions";
import {
  FinalCertifiedStatusFields,
  InProgressStatusFields,
  NotRequiredStatusFields,
  ProvisionalCertifiedStatusFields
} from "../../utility-functions/formStatus";

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn()
}));

const renderComponent = (user, statusData) => {
  getUserInfo.mockResolvedValue({ Items: [user] });
  const initialStore = {
    ...fullStoreMock,
    currentForm: {
      ...fullStoreMock.currentForm,
      statusData
    }
  };
  const store = storeFactory(initialStore);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <NotApplicable />
      </BrowserRouter>
    </Provider>
  );
};

const stateUser = { role: "state" };
const adminUser = { role: "admin" };

describe("NotApplicable", () => {
  it("should be enabled for state users viewing an in-progress form", async () => {
    renderComponent(stateUser, InProgressStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeEnabled();
    expect(noButton).toBeEnabled();
  });

  it("should be disabled for admin users", async () => {
    renderComponent(adminUser, InProgressStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });

  it("should be disabled for state users viewing a certified form", async () => {
    renderComponent(stateUser, FinalCertifiedStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });

  it("should initialize to Active when applicable", async () => {
    renderComponent(stateUser, InProgressStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    expect(yesButton).toBeChecked();
  });

  it("should initialize to Yes for a Certified form", async () => {
    renderComponent(stateUser, ProvisionalCertifiedStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeChecked();
  });

  it("should initialize to Not Applicable when appropriate", async () => {
    renderComponent(stateUser, NotRequiredStatusFields());
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeChecked();
  });
});
