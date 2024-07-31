import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import fullStoreMock from "../../provider-mocks/fullStoreMock";
import PrintPDF from "./PrintPDF";
import { storeFactory } from "../../provider-mocks/testUtils";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { getSingleForm, getStateForms } from "../../libs/api";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({
    state: "AL",
    year: "2021",
    quarter: "01",
    formName: "21E"
  }),
}));

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn().mockResolvedValue({
    Items: [
      {
        states: "AL",
      },
    ],
  }),
}));

jest.mock("../../libs/api", () => ({
  getSingleForm: jest.fn(),
  getStateForms: jest.fn(),
}));
getSingleForm.mockResolvedValue(fullStoreMock.currentForm);
getStateForms.mockResolvedValue({ Items: [fullStoreMock.currentForm.statusData] });

const renderComponent = () => {
  const store = storeFactory(fullStoreMock);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <PrintPDF/>
      </BrowserRouter>
    </Provider>
  );
};

describe("PrintPDF component", () => {
  it("should render appropriate sub-components", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled);
    
    const breadcrumbs = container.querySelectorAll(".breadcrumbs a");
    const expectedHrefs = [
      "/",
      "/forms/AL/2021/01",
      "/forms/AL/2021/01/21E",
    ];
    expect(breadcrumbs.length).toBe(expectedHrefs.length);
    for (let i = 0; i < expectedHrefs.length; i += 1) {
      expect(breadcrumbs[i].href).toMatch(new RegExp(expectedHrefs[i] + "$"));
    }

    const printButton = screen.getByText("Print / PDF", { selector: "button" });
    expect(printButton).toBeInTheDocument();

    const headers = screen.getAllByText(
      "Form 21E | AL | 2021 | Quarter 01",
      { selector: "h2" }
    );
    expect(headers.length).toBe(2);

    for (let ageRange of fullStoreMock.global.age_ranges) {
      const sectionHeader = screen.getByText(
        ageRange.ageDescription,
        { exact: false, selector: "h3" }
      );
      expect(sectionHeader).toBeInTheDocument();
    }
  });
});
