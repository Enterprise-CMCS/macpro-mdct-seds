import React from "react";
import FormPage from "./FormPage";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { getUserInfo } from "../../utility-functions/userFunctions";

jest.mock("../FormHeader/FormHeader", () =>
  (props) => <div className="form-header">{JSON.stringify(props)}</div>,
);

jest.mock("../NotApplicable/NotApplicable", () =>
  (props) => <div className="not-applicable">{JSON.stringify(props)}</div>,
);

jest.mock("../TabContainer/TabContainer", () =>
  (props) => <div className="tab-container">{JSON.stringify(props)}</div>,
);

jest.mock("../FormFooter/FormFooter", () =>
  (props) => <div className="form-footer">{JSON.stringify(props)}</div>,
);

jest.mock("../FormLoadError/FormLoadError", () =>
  (props) => <div className="form-load-error">{JSON.stringify(props)}</div>,
);

jest.mock("../Unauthorized/Unauthorized", () =>
  (props) => <div className="unauth-cmpt">{JSON.stringify(props)}</div>,
);

jest.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: jest.fn(),
}));

jest.mock("../../store/reducers/singleForm/singleForm", () => ({
  getFormData: jest.fn().mockReturnValue({
    type: "SAVING A FORM HERE, BOSS",
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn().mockReturnValue({
    state: "CO",
    year: "2024",
    quarter: "3",
    formName: "21E",
  }),
}));

const mockUser = {
  role: "state",
  states: ["CO"],
};

const mockForm = {
  statusData: {
    last_modified: "2024-07-27T10:01:42Z",
    save_error: false,
  },
  loadError: "",
}

const renderComponent = (form, user) => {
  getUserInfo.mockResolvedValue({ Items: [user]})
  
  const mockstore = configureStore([]);
  const store = mockstore({ currentForm: form });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <FormPage/>
      </BrowserRouter>
    </Provider>
  )
};

describe("FormPage", () => {
  it("should render a form for state users with access", async () => {
    const { container } = renderComponent(mockForm, mockUser);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    const formHeader = container.querySelector(".form-header");
    expect(formHeader).toBeInTheDocument();
    const formHeaderProps = JSON.parse(formHeader.textContent);
    expect(formHeaderProps).toEqual(
      {
        state: "CO",
        year: "2024",
        quarter: "3",
        form: "21E",
      }
    );
    
    const printButton = screen.getByText(
      "Print view / PDF",
      { selector: "button" }
    );
    expect(printButton).toBeInTheDocument();

    const notApplicable = container.querySelector(".not-applicable");
    expect(notApplicable).toBeInTheDocument();
    
    const tabContainer = container.querySelector(".tab-container");
    expect(tabContainer).toBeInTheDocument();

    const formFooter = container.querySelector(".form-footer");
    expect(formFooter).toBeInTheDocument();
    const formFooterProps = JSON.parse(formFooter.textContent);
    expect(formFooterProps).toEqual(
      {
        state: "CO",
        year: "2024",
        quarter: "3",
        lastModified: "2024-07-27T10:01:42Z"
      }
    );

    const unauthorized = container.querySelector(".unauth-cmpt");
    expect(unauthorized).not.toBeInTheDocument();
  });

  it("should render a form for admin users", async () => {
    const user = { role: "admin", states: [] };

    const { container } = renderComponent(mockForm, user);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

    const tabContainer = container.querySelector(".tab-container");
    expect(tabContainer).toBeInTheDocument();

    const unauthorized = container.querySelector(".unauth-cmpt");
    expect(unauthorized).not.toBeInTheDocument();
  });

  it("should not render a form for state users from other states", async () => {
    const user = { role: "state", states: ["TX"] };

    const { container } = renderComponent(mockForm, user);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());

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
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const saveMessage = container.querySelector(".save-success");
    expect(saveMessage.textContent).toBe("Save success:Form 21E has been successfully saved.");
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
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const errorMessage = container.querySelector(".save-error");
    expect(errorMessage.textContent).toBe(
      "Save Error:A problem occurred while saving. Please save again. If the problem persists, contact MDCT_Help@cms.hhs.gov"
    );
  });

  it("should render an error message when the form has failed to load", async () => {
    const form = {
      ...mockForm,
      loadError: true,
    };
    const { container } = renderComponent(form, mockUser);
    await waitFor(() => expect(getUserInfo).toHaveBeenCalled());
    
    const errorMessage = container.querySelector(".form-load-error");
    expect(errorMessage).toBeInTheDocument();
  });
});
