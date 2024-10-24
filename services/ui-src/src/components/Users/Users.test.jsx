import React from "react";
import Users from "./Users";
import { BrowserRouter } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { listUsers } from "../../libs/api";
import { handleExport } from "../../utility-functions/exportFunctions";

jest.mock("../../libs/api", () => ({
  listUsers: jest.fn().mockResolvedValue([]),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: jest.fn(),
}));

jest.mock("../../utility-functions/exportFunctions", () => ({
  handleExport: jest.fn()
}));

// Note that the default sort is by username,
// so ASDF will be before QWER when the page is rendered.
const mockUsers = [
  {
    userId: 23,
    username: "QWER",
    firstName: "Quentin",
    lastName: "Werther",
    email: "qwer@email.test",
    role: "state",
    dateJoined: "2024-01-15T12:34:45Z",
    lastLogin: "2024-02-16T12:34:45Z",
    states: ["CO"],
  },
  {
    userId: 42,
    username: "ASDF",
    firstName: "Ascot Soloniel",
    lastName: "D'Fern",
    email: "asdf@email.test",
    role: "admin",
    dateJoined: "2024-03-17T12:34:45Z",
    lastLogin: "2024-04-18T12:34:45Z",
    states: ["WI", "TX", "CO"],
  },
];
listUsers.mockResolvedValue(mockUsers);

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <Users/>
    </BrowserRouter>
  );
};

describe("Test Users.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the correct controls", async () => {
    renderComponent();
    await waitFor(() => expect(listUsers).toHaveBeenCalled());
    
    expect(screen.getByText(
      "Add New User",
      { selector: "button" }
    )).toBeInTheDocument();

    expect(screen.getByText(
      "CSV",
      { selector: "button" }
    )).toBeInTheDocument();

    expect(screen.getByText(
      "PDF",
      { selector: "button" }
    )).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Filter Table")).toBeInTheDocument();
  });

  it("should render the correct headers", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(listUsers).toHaveBeenCalled());

    const expectedHeaders = [
      "Username",
      "First Name",
      "Last Name",
      "Email",
      "Role",
      "Registration Date",
      "Last Login",
      "States",
    ]
    const headers = [...container.querySelectorAll(".rdt_TableHeadRow > div")];
    expect(headers.length).toBe(expectedHeaders.length);
    for (let i = 0; i < expectedHeaders.length; i += 1) {
      expect(headers[i].textContent).toBe(expectedHeaders[i]);
    }
  });

  it("should render the correct data", async () => {
    const { container } = renderComponent();
    await waitFor(() => expect(listUsers).toHaveBeenCalled());

    const rows = [...container.querySelectorAll(".rdt_TableBody [role='row']")];
    expect(rows.length).toBe(mockUsers.length);

    let row1cells = rows[0].childNodes;
    expect(row1cells.length).toBe(8);
    
    const editLink = row1cells[0].querySelector("a");
    expect(editLink).toBeInTheDocument();
    expect(editLink.textContent).toBe("ASDF");
    expect(editLink.href).toMatch(new RegExp("/users/42/edit"));

    expect(row1cells[1].textContent).toBe("Ascot Soloniel");

    expect(row1cells[2].textContent).toBe("D'Fern");

    const emailLink = row1cells[3].querySelector("a");
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.textContent).toBe("asdf@email.test");
    expect(emailLink.href).toBe("mailto:asdf@email.test");

    expect(row1cells[4].textContent).toBe("admin");

    expect(row1cells[5].textContent).toBe("3/17/2024");

    expect(row1cells[6].textContent).toBe("4/18/2024");

    expect(row1cells[7].textContent).toBe("CO, TX, WI");
  });

  it("should navigate to the new user page when the add button is clicked", async () => {
    const mockHistory = [];
    useHistory.mockReturnValue(mockHistory);

    renderComponent();
    await waitFor(() => expect(listUsers).toHaveBeenCalled());

    const addButton = screen.getByText(
      "Add New User",
      { selector: "button" }
    );
    userEvent.click(addButton);

    expect(mockHistory).toEqual(["/users/add"]);
  });

  it("should export to CSV somehow", async () => {
    renderComponent();
    await waitFor(() => expect(listUsers).toHaveBeenCalled());

    const csvButton = screen.getByText(
      "CSV",
      { selector: "button" }
    );
    userEvent.click(csvButton);
    
    expect(handleExport).toHaveBeenCalledWith(
      "csv",
      "MDCT Users Export.csv",
      expect.objectContaining({
        data: mockUsers,
      })
    );
  });

  it("should export to PDF somehow", async () => {
    renderComponent();
    await waitFor(() => expect(listUsers).toHaveBeenCalled());

    const pdfButton = screen.getByText(
      "PDF",
      { selector: "button" }
    );
    userEvent.click(pdfButton);
    
    expect(handleExport).toHaveBeenCalledWith(
      "pdf",
      "MDCT Users Export.pdf",
      ".user-profiles",
      "html-selector",
    );
  });
});
