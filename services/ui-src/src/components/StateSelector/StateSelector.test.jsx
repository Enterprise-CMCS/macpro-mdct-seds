import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import { BrowserRouter, useHistory } from "react-router-dom";
import StateSelector from "./StateSelector";
import { storeFactory } from "../../provider-mocks/testUtils";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event"
import { getUserInfo } from "../../utility-functions/userFunctions";
import { updateUser } from "../../libs/api";

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

vi.mock("../../libs/api", () => ({
  updateUser: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useHistory: vi.fn(),
}));

const store = storeFactory({
  global: {
      states: [
      { state_name: "Colorado", state_id: "CO" },
      { state_name: "Texas", state_id: "TX" },
      { state_name: "Wisconsin", state_id: "WI" },
    ],
  },
});

const renderComponent = (user) => {
  getUserInfo.mockResolvedValue({ Items: [user] });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <StateSelector/>
      </BrowserRouter>
    </Provider>
  )
};

describe("StateSelector component", () => {
  it("should render an alert for users with a state", async () => {
    const { container } = renderComponent({ states: ["CO"] });
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    expect(screen.getByText(
      "This account has already been associated with a state: CO"
    )).toBeInTheDocument();

    expect(screen.queryByText(
      "This account is not associated with any states"
    )).not.toBeInTheDocument();
    expect(container.querySelector(".Dropdown-root")).not.toBeInTheDocument();
    expect(screen.queryByText(
      "Update User", { selector: "button" }
    )).not.toBeInTheDocument();
  });

  it("should render a selector for users with no state", async () => {
    const { container } = renderComponent({ states: [] });
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    expect(screen.queryByText(
      "This account has already been associated with a state", { exact: false }
    )).not.toBeInTheDocument();

    expect(screen.getByText(
      "This account is not associated with any states"
    )).toBeInTheDocument();
    expect(container.querySelector(".Dropdown-root")).toBeInTheDocument();
    expect(screen.getByText(
      "Update User", { selector: "button" }
    )).toBeInTheDocument();
  });

  it("should save the user's selected state, and redirect them to Home", async () => {
    vi.spyOn(window, "confirm").mockImplementation(() => true);
    const mockHistory = { push: vi.fn() };
    useHistory.mockReturnValue(mockHistory);

    renderComponent({ id: 42, states: [] });
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    userEvent.click(screen.getByText("Select a state"));
    userEvent.click(screen.getByText("Colorado"));
    userEvent.click(screen.getByText("Update User", { selector: "button" }));
    
    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({ id: 42, states: ["CO"] });
    })
    expect(mockHistory.push).toHaveBeenCalledWith("/");
  })
});
