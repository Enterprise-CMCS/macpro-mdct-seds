import React from "react";
import { describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Quarterly from "../Quarterly/Quarterly";
import { render, screen, waitFor } from "@testing-library/react";
import quarterlyDataMock from "../../provider-mocks/quarterlyDataMock";
import { recursiveGetStateForms } from "../../utility-functions/dbFunctions";
import { useStore } from "../../store/store";
import { getStateForms } from "libs/api";

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn().mockReturnValue({
    state: "AL",
    year: "2021",
    quarter: "01",
  }),
}));

vi.mock("libs/api", () => ({
  getStateForms: vi.fn(),
}));
getStateForms.mockResolvedValue({ Items: quarterlyDataMock });

const forms = [
  {
    id: "GRE",
    name: "Gender, Race & Ethnicity",
    status: "In Progress",
    date: "4/8/2021 at 8:46:35 AM EDT",
  },
  {
    id: "21PW",
    name: "Number of Pregnant Women Served",
    status: "In Progress",
    date: "4/7/2021 at 8:46:35 AM EDT",
  },
  {
    id: "64.21E",
    name: "Number of Children Served in Medicaid Expansion Program",
    status: "Provisional Data Certified and Submitted",
    date: "4/6/2021 at 8:46:35 AM EDT",
  },
  {
    id: "21E",
    name: "Number of Children Served in Separate CHIP Program",
    status: "Final Data Certified and Submitted",
    date: "4/5/2021 at 8:46:35 AM EDT",
  },
  {
    id: "64.EC",
    name: "Number of Children Served in Medicaid Program",
    status: "Final Data Certified and Submitted",
    date: "4/4/2021 at 8:46:35 AM EDT",
  },
];

const renderComponent = () => {
  useStore.setState({
    user: { role: "state", state: "AL" },
  });
  return render(
    <BrowserRouter>
      <Quarterly />
    </BrowserRouter>
  );
};

describe("Quarterly tests", () => {
  it("should render correctly", async () => {
    const { container } = renderComponent();
    await waitFor(() => {
      expect(getStateForms).toHaveBeenCalled();
    });

    expect(
      screen.getByText("Q01 2021 Reports", { selector: "h1" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Enrollment Data Home", { selector: ".breadcrumbs a" })
    ).toBeInTheDocument();

    const rows = container.querySelectorAll("table tbody tr");
    expect(rows.length).toBe(forms.length);

    for (let i = 0; i < forms.length; i += 1) {
      const row = rows[i];
      const cells = [...row.querySelectorAll("td")];
      const [idCell, nameCell, statusCell, lastUpdatedCell, printCell] = cells;
      const form = forms[i];

      expect(idCell.textContent).toBe(form.id);
      const idHref = idCell.querySelector("a").href;
      expect(idHref).toContain(
        `/forms/AL/2021/01/${form.id.replace(".", "-")}`
      );

      expect(nameCell.textContent).toBe(form.name);

      expect(statusCell.textContent).toBe(form.status);

      expect(lastUpdatedCell.textContent).toBe(form.date);

      const printHref = printCell.querySelector("a").href;
      expect(printHref).toContain(
        `/print/AL/2021/01/${form.id.replace(".", "-")}`
      );
    }
  });
});
