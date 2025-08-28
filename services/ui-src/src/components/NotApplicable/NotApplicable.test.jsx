import React from "react";
import { Provider } from "react-redux";
import { render, screen, waitFor } from "@testing-library/react";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import NotApplicable from "./NotApplicable";
import { storeFactory } from "../../provider-mocks/testUtils";
import { BrowserRouter } from "react-router-dom";
import { getUserInfo } from "../../utility-functions/userFunctions";

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
        status_id: status_id,
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
    renderComponent(stateUser, 1);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeEnabled();
    expect(noButton).toBeEnabled();
  });

  it("should be disabled for admin users", async () => {
    renderComponent(adminUser, 1);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });

  it("should be disabled for state users viewing a certified form", async () => {
    renderComponent(stateUser, 3);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });

  it("should initialize to Active when applicable", async () => {
    renderComponent(stateUser, 1);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    expect(yesButton).toBeChecked();
  });

  it("should initialize to Yes for a Certified form", async () => {
    renderComponent(stateUser, 2);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeChecked();
  });

  it("should initialize to Not Applicable when appropriate", async () => {
    renderComponent(stateUser, 4);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const yesButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeChecked();
  });
});
