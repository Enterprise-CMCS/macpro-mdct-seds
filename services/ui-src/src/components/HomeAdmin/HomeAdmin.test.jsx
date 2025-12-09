import { describe, expect, it, vi, beforeEach } from "vitest";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { useStore } from "../../store/store";

vi.mock("../../libs/contextLib", () => ({
  useAppContext: vi.fn()
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn()
}));

vi.mock("utility-functions/sortingFunctions", async () => ({
  ...(await vi.importActual("utility-functions/sortingFunctions")),
  buildSortedAccordionByYearQuarter: vi.fn().mockReturnValue([])
}));

const renderComponent = () => {
  useStore.setState({ user: { role: "admin" } });
  return render(
    <BrowserRouter>
      <HomeAdmin />
    </BrowserRouter>
  );
};

const forms = [
  {
    id: 2021,
    description: "Quarters for 2021",
    title: 2021,
    content: [<></>],
    headingLevel: "h1", // unsure
    expanded: false
  }
];

describe("Tests for HomeAdmin.js", () => {
  it("should render navigation links", async () => {
    const { container } = renderComponent();
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
    expect(container.querySelector(".Dropdown-root.state-select-list")).toBeInTheDocument();
  });

  describe("should update state selector when a state is picked", () => {
    beforeEach(async () => {
      renderComponent();
      await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

      const stateDropdown = screen.getByText("Select a state");
      userEvent.click(stateDropdown);
    });
    it("when no forms exist in the state", async () => {
      const stateOption = screen.getByText("Alabama");
      userEvent.click(stateOption);

      await waitFor(() =>
        expect(
          screen.getByText(
            "There are no forms available for the selected state"
          )
        ).toBeInTheDocument()
      );
    });
    it("when forms exist in the state", async () => {
      buildSortedAccordionByYearQuarter.mockReturnValue(forms);
      const stateOption = screen.getByText("Alabama");
      userEvent.click(stateOption);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: "2021" })).toBeInTheDocument()
      );
    });
  });
});
