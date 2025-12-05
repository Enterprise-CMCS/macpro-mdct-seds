import React from "react";
import { describe, expect, it, vi } from "vitest";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { getUserInfo } from "../../utility-functions/userFunctions";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

const adminUser = { role: "admin" };

const renderComponent = () => {
  getUserInfo.mockResolvedValue({ Items: [adminUser] });
  return render(
    <BrowserRouter>
      <HomeAdmin user={adminUser}/>
    </BrowserRouter>
  );
}

describe("Tests for HomeAdmin.js", () => {
  it("should render navigation links", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    const links = [...container.querySelectorAll("h1 ~ div ul li a")];
    expect(links.map(a => a.textContent)).toEqual([
      "View / Edit Users",
      "Add/Edit Form Templates",
      "Generate Quarterly Forms",
      "Generate Total Enrollment Counts",
    ]);
  });

  it("should render a state selector", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    expect(container.querySelector(".Dropdown-root.state-select-list")).toBeInTheDocument();
  });
});
