import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Quarterly from "../Quarterly/Quarterly";
import { render, screen, waitFor } from "@testing-library/react";
import quarterlyDataMock from "../../provider-mocks/quarterlyDataMock";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { recursiveGetStateForms } from "../../utility-functions/dbFunctions";
import { FormStatusDisplay } from "../../utility-functions/types";

const mockStore = configureStore([]);
let store = mockStore(mockStore);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({
    state: "AL",
    year: "2021",
    quarter: "01"
  }),
}));

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn().mockResolvedValue({
    Items: [{ states: ["AL"] }],
  }),
}));

jest.mock("../../utility-functions/dbFunctions", () => ({
  recursiveGetStateForms: jest.fn(),
}));
recursiveGetStateForms.mockResolvedValue(quarterlyDataMock);

const expectedDisplayedForms = [
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
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <Quarterly/>
      </BrowserRouter>
    </Provider>
  )
};

describe("Quarterly tests", () => {
  it("should render correctly", async () => {
    const { container } = renderComponent();
    await waitFor(() => {
      expect(getUserInfo).toHaveBeenCalled();
      expect(recursiveGetStateForms).toHaveBeenCalled();
    });

    expect(screen.getByText(
      "Q01 2021 Reports",
      { selector: "h1" }
    )).toBeInTheDocument();

    expect(screen.getByText(
      "Enrollment Data Home",
      { selector: ".breadcrumbs a" }
    )).toBeInTheDocument();

    const rows = container.querySelectorAll("table tbody tr");
    expect(rows.length).toBe(expectedDisplayedForms.length);

    for (let i = 0; i < expectedDisplayedForms.length; i += 1) {
      const row = rows[i];
      const cells = [...row.querySelectorAll("td")];
      const [ idCell, nameCell, statusCell, lastUpdatedCell, printCell] = cells;
      const form = expectedDisplayedForms[i];

      expect(idCell.textContent).toBe(form.id);
      const idHref = idCell.querySelector("a").href;
      expect(idHref).toContain(`/forms/AL/2021/01/${form.id.replace(".", "-")}`);

      expect(nameCell.textContent).toBe(form.name);

      expect(statusCell.textContent).toBe(form.status);

      expect(lastUpdatedCell.textContent).toBe(form.date);

      const printHref = printCell.querySelector("a").href
      expect(printHref).toContain(`/print/AL/2021/01/${form.id.replace(".", "-")}`);
    }
  });
});
