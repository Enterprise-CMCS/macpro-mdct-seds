import { describe, expect, it, vi, beforeEach } from "vitest";
import HomeAdmin from "./HomeAdmin";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import { screen, render, waitFor } from "@testing-library/react";
import { getUserInfo } from "../../utility-functions/userFunctions";
import userEvent from "@testing-library/user-event";
import { buildSortedAccordionByYearQuarter } from "utility-functions/sortingFunctions";

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
