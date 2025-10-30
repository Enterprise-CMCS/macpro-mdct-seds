import React from "react";
import { describe, expect, it, vi } from "vitest";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { render, waitFor } from "@testing-library/react";
import { getUserInfo } from "../../utility-functions/userFunctions";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn()
}));

const mockStore = configureStore([]);

const adminUser = {
  attributes: {
    "app-role": "admin"
  }
};

const renderComponent = () => {
  const store = mockStore(fullStoreMock);
  getUserInfo.mockResolvedValue({ Items: [adminUser] });
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <HomeAdmin user={adminUser} />
      </BrowserRouter>
    </Provider>
  );
};

describe("Tests for HomeAdmin.js", () => {
  it("should render navigation links", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const links = [...container.querySelectorAll("h1 ~ div ul li a")];
    expect(links.map(a => a.textContent)).toEqual([
      "View / Edit Users",
      "Add/Edit Form Templates",
      "Generate Quarterly Forms",
      "Generate Total Enrollment Counts"
    ]);
  });

  it("should render a state selector", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    expect(
      container.querySelector(".Dropdown-root.state-select-list")
    ).toBeInTheDocument();
  });
});
