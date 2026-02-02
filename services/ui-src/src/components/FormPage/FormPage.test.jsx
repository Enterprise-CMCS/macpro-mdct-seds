import React from "react";
import { describe, expect, it, vi } from "vitest";
import FormPage from "./FormPage";
import { BrowserRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useStore } from "../../store/store";
import userEvent from "@testing-library/user-event";

vi.mock("../FormHeader/FormHeader", () => ({
  default: (props) => (
    <div>{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../NotApplicable/NotApplicable", () => ({
  default: (props) => (
    <div>{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../TabContainer/TabContainer", () => ({
  default: (props) => (
    <div>{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../FormFooter/FormFooter", () => ({
  default: (props) => (
    <div>{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../FormLoadError/FormLoadError", () => ({
  default: (props) => (
    <div>{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../Unauthorized/Unauthorized", () => ({
  default: (props) => (
    <div>{JSON.stringify(props)}</div>
  ),
}));

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal()),
  useParams: vi.fn().mockReturnValue({
    state: "CO",
    year: "2024",
    quarter: "3",
    formName: "21E",
  }),
}));

const mockUser = {
  role: "state",
  state: "CO",
};

const mockForm = {
  statusData: {
    last_modified: "2024-07-27T10:01:42Z",
    save_error: false,
  },
  loadError: "",
};

const renderComponent = (form, user) => {
  useStore.setState({
    user,
    statusData: form.statusData,
    loadError: form.loadError,
    loadForm: vi.fn(),
  });

  return render(
    <BrowserRouter>
      <FormPage />
    </BrowserRouter>
  );
};

window.confirm = vi.fn(() => true);

describe("FormPage", () => {
  it("should render a form for state users with access", async () => {
    const { container } = renderComponent(mockForm, mockUser);
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const formHeader = container.querySelector(".form-header");
    expect(formHeader).toBeInTheDocument();
    const formHeaderProps = JSON.parse(formHeader.textContent);
    expect(formHeaderProps).toEqual({
      state: "CO",
      year: "2024",
      quarter: "3",
      form: "21E",
    });

    const printButton = screen.getByText("Print view / PDF", {
      selector: "button",
    });
    expect(printButton).toBeInTheDocument();

    const notApplicable = container.querySelector(".not-applicable");
    expect(notApplicable).toBeInTheDocument();

    const tabContainer = container.querySelector(".tab-container");
    expect(tabContainer).toBeInTheDocument();

    const formFooter = container.querySelector(".form-footer");
    expect(formFooter).toBeInTheDocument();
    const formFooterProps = JSON.parse(formFooter.textContent);
    expect(formFooterProps).toEqual({
      state: "CO",
      year: "2024",
      quarter: "3",
      lastModified: "2024-07-27T10:01:42Z",
    });

    const unauthorized = container.querySelector(".unauth-cmpt");
    expect(unauthorized).not.toBeInTheDocument();
  });

  it("should render a form for admin users", async () => {
    const user = { role: "admin", state: undefined };

    const { container } = renderComponent(mockForm, user);
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const tabContainer = container.querySelector(".tab-container");
    expect(tabContainer).toBeInTheDocument();

    const unauthorized = container.querySelector(".unauth-cmpt");
    expect(unauthorized).not.toBeInTheDocument();
  });

  it("should not render a form for state users from other states", async () => {
    const user = { role: "state", state: "TX" };

    const { container } = renderComponent(mockForm, user);

    const tabContainer = container.querySelector(".tab-container");
    expect(tabContainer).not.toBeInTheDocument();

    const unauthorized = container.querySelector(".unauth-cmpt");
    expect(unauthorized).toBeInTheDocument();
  });

  it("should render a success message when the form has just been modified", async () => {
    const form = {
      ...mockForm,
      statusData: {
        ...mockForm.statusData,
        last_modified: new Date().toISOString(),
      },
    };
    const { container } = renderComponent(form, mockUser);
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const saveMessage = container.querySelector(".ds-c-alert");

    expect(saveMessage.textContent).toBe(
      "Success: Save success:Form 21E has been successfully saved."
    );
  });

  it("should render an error message when the form has failed to save", async () => {
    const form = {
      ...mockForm,
      statusData: {
        ...mockForm.statusData,
        save_error: true,
      },
    };
    const { container } = renderComponent(form, mockUser);
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const errorMessage = container.querySelector(".ds-c-alert");
    expect(errorMessage.textContent).toBe(
      "Alert: Save Error:A problem occurred while saving. Please save again. If the problem persists, contact MDCT_Help@cms.hhs.gov"
    );
  });

  it("should render an error message when the form has failed to load", async () => {
    const form = {
      ...mockForm,
      loadError: true,
    };
    const { container } = renderComponent(form, mockUser);
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const errorMessage = container.querySelector(".form-load-error");
    expect(errorMessage).toBeInTheDocument();
  });
  it("should have a confirm window when clicking print view", async () => {
    renderComponent(mockForm, mockUser);
    await waitFor(() => expect(useStore.getState().loadForm).toBeCalled());

    const pdfBtn = screen.getByRole("button", { name: "Print view / PDF" });
    userEvent.click(pdfBtn);
    expect(window.confirm).toBeCalled();
  });
});
