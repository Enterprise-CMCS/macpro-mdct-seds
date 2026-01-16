import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { render, waitFor, screen } from "@testing-library/react";
import { useStore } from "../../store/store";
import userEvent from "@testing-library/user-event";
import { buildSortedAccordionByYearQuarter } from "utility-functions/sortingFunctions";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn(),
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

vi.mock("utility-functions/sortingFunctions", async () => ({
  ...(await vi.importActual("utility-functions/sortingFunctions")),
  buildSortedAccordionByYearQuarter: vi.fn().mockReturnValue([]),
}));

const forms = [
  {
    id: 2021,
    description: "Quarters for 2021",
    title: 2021,
    content: [<></>],
    headingLevel: "h1", // unsure
    expanded: false,
  },
];

const renderComponent = () => {
  useStore.setState({ user: { role: "admin" } });
  return render(
    <BrowserRouter>
      <HomeAdmin />
    </BrowserRouter>
  );
};

describe("Tests for HomeAdmin.js", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("should render navigation links", async () => {
    const { container } = renderComponent();
    const links = [...container.querySelectorAll("h1 ~ div ul li a")];
    expect(links.map((a) => a.textContent)).toEqual([
      "View / Edit Users",
      "Add/Edit Form Templates",
      "Generate Quarterly Forms",
      "Generate Total Enrollment Counts",
    ]);
  });

  it("should display an appropriate message for a state with no forms", async () => {
    renderComponent();

    const stateDropdown = screen.getByRole("combobox", { name: /State/ });
    userEvent.selectOptions(stateDropdown, "Alabama");

    await waitFor(() =>
      expect(
        screen.getByText("There are no forms available for the selected state")
      ).toBeInTheDocument()
    );
  });

  it("should display a year accordion for a state which has forms", async () => {
    buildSortedAccordionByYearQuarter.mockReturnValueOnce(forms);

    renderComponent();

    const stateDropdown = screen.getByRole("combobox", { name: /State/ });
    userEvent.selectOptions(stateDropdown, "Alabama");

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "2021" })).toBeInTheDocument()
    );
  });
});
