import React from "react";
import { describe, expect, it, vi } from "vitest";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { useStore } from "../../store/store";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

const renderComponent = () => {
  useStore.setState({ user: { role: "admin" } });
  return render(
    <BrowserRouter>
      <HomeAdmin />
    </BrowserRouter>
  );
}

describe("Tests for HomeAdmin.js", () => {
  it("should render navigation links", async () => {
    const { container } = renderComponent();
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
    expect(container.querySelector(".Dropdown-root.state-select-list")).toBeInTheDocument();
  });
});
