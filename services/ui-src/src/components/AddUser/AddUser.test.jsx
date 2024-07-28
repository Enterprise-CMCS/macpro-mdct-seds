import React from "react";
import AddUser from "./AddUser";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { BrowserRouter } from "react-router-dom";
import { adminCreateUser } from "../../libs/api";

jest.mock("../../libs/api", () => ({
  adminCreateUser: jest.fn().mockResolvedValue("Created!"),
}));

const mockStore = configureMockStore([]);
const store = mockStore({
  global: {
    states: [
      { state_name: "Colorado", state_id: "CO" },
      { state_name: "Texas", state_id: "TX" },
      { state_name: "Wisconsin", state_id: "WI" },
    ],
  },
});

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <AddUser />
      </BrowserRouter>
    </Provider>
  );
}

describe("Test AddUser.jsx", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should render a form", () => {
    const { container } = renderComponent();
    expect(screen.getByText("User List", { selector: "a" })).toBeInTheDocument();
    expect(container.querySelector("input.eua-ID")).toBeInTheDocument();
    expect(container.querySelector("input[placeholder='Select a Role']")).toBeInTheDocument();
    expect(screen.getByText("Add User", { selector: "button" })).toBeInTheDocument();
  });

  it("should render a single-select statelist for new state users", () => {
    renderComponent();
    userEvent.click(screen.getByPlaceholderText("Select a Role"));
    userEvent.click(screen.getByText("State User"));
    expect(screen.getByPlaceholderText("Select a State")).toBeInTheDocument();
  });

  it("should render a multi-select statelist for new admin users", () => {
    const { container } = renderComponent();
    userEvent.click(screen.getByPlaceholderText("Select a Role"));
    userEvent.click(screen.getByText("Admin User"));
    expect(container.querySelector("[aria-labelledby='Select States']")).toBeInTheDocument();
  });

  it("should call the API to save a new user", async () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});

    const { container } = renderComponent();

    const euaIdInput = container.querySelector("input.eua-ID");
    userEvent.type(euaIdInput, "QWER");

    userEvent.click(screen.getByPlaceholderText("Select a Role"));
    userEvent.click(screen.getByText("State User"));

    userEvent.click(screen.getByPlaceholderText("Select a State"));
    userEvent.click(screen.getByText("Colorado"));

    userEvent.click(screen.getByText("Add User", { selector: "button" }));

    await waitFor(() => {
      expect(adminCreateUser).toHaveBeenCalledWith({
        username: "QWER",
        role: "state",
        states: ["CO"],
      });
      expect(window.alert).toHaveBeenCalledWith("Created!");
    });
  });
});
