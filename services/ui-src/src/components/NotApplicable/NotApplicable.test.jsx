import React from "react";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";
import { BrowserRouter } from "react-router-dom";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { FormStatus } from "../../utility-functions/types";

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn(),
}));

const renderComponent = (user, status_id) => {
  getUserInfo.mockResolvedValue({ Items: [user] });
  const initialStore = {
    ...fullStoreMock,
    currentForm: {
      ...fullStoreMock.currentForm,
      statusData: {
        ...fullStoreMock.currentForm.statusData,
        status_id,
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
    renderComponent(stateUser, FormStatus.InProgress);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeEnabled();
    const noOption = screen.getByRole("radio", { name: "Not Applicable" });
    expect(noOption).toBeEnabled();
  });

  it("should be disabled for admin users", async () => {
    renderComponent(adminUser, FormStatus.InProgress);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeDisabled();
    const noOption = screen.getByRole("radio", { name: "Not Applicable" });
    expect(noOption).toBeDisabled();
  });

  it("should be disabled for state users viewing a certified form", async () => {
    renderComponent(stateUser, FormStatus.ProvisionalCertified);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeDisabled();
    const noOption = screen.getByRole("radio", { name: "Not Applicable" });
    expect(noOption).toBeDisabled();
  });

  it("should initialize to Yes for an In-Progress form", async () => {
    renderComponent(stateUser, FormStatus.InProgress);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeChecked();
  });

  it("should initialize to Yes for a Certified form", async () => {
    renderComponent(stateUser, FormStatus.ProvisionalCertified);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeChecked();
  });

  it("should initialize to Not Applicable when appropriate", async () => {
    renderComponent(stateUser, FormStatus.NotApplicable);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const noOption = screen.getByRole("radio", { name: "Not Applicable" });
    expect(noOption).toBeChecked();
  });
});
