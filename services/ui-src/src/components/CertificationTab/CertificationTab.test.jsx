import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CertificationTab from "../CertificationTab/CertificationTab";
import {
  FinalCertifiedStatusFields,
  InProgressStatusFields,
  ProvisionalCertifiedStatusFields
} from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

const mockUser = {
  status: "success",
  email: "email@email.com",
  name: "Test User",
  states: ["CA"],
  role: "state"
};

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: () => Promise.resolve(mockUser)
}));

const updateFormStatus = vi.fn();
const saveForm = vi.fn();

const renderWithStatus = (role, statusFields) => {
  useStore.setState({
    user: { role },
    statusData: {
      ...statusFields,
      status_date: "2025-11-26T22:45:38.115Z",
      status_modified_by: "George Tester",
    },
    updateFormStatus,
    saveForm,
  });
  return render(<CertificationTab />);
};

describe("Test CertificationTab.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not display certify buttons to admin users", () => {
    renderWithStatus("admin", InProgressStatusFields());
    const buttons = screen.queryAllByRole("button");
    expect(buttons).toHaveLength(0);
  });

  it("should not display status text for in-progress forms", () => {
    renderWithStatus("state", InProgressStatusFields());
    expect(screen.queryByTestId("statusText")).not.toBeInTheDocument();
  });

  it("should display status text for provisional forms", () => {
    renderWithStatus("state", ProvisionalCertifiedStatusFields());
    const expectedText = "This report was updated to Provisional Data Certified and Submitted on 11/26/2025 at 5:45:38 PM EST by George Tester";
    const statusElement = screen.getByTestId("statusText");
    expect(statusElement).toHaveTextContent(expectedText);
  });

  it("should display status text for final forms", () => {
    renderWithStatus("state", FinalCertifiedStatusFields());
    const expectedText = "This report was updated to Final Data Certified and Submitted on 11/26/2025 at 5:45:38 PM EST by George Tester";
    const statusElement = screen.getByTestId("statusText");
    expect(statusElement).toHaveTextContent(expectedText);
  })

  it("should allow certify, but not uncertify for in-progress forms", () => {
    renderWithStatus("state", InProgressStatusFields());
    expect(screen.getByText("Certify & Submit Provisional Data", { selector: "button" })).not.toBeDisabled();
    expect(screen.getByText("Certify & Submit Final Data", { selector: "button" })).not.toBeDisabled();
    expect(screen.queryByText("Uncertify", { selector: "button" })).not.toBeInTheDocument();
  });

  it("should allow final certify, but not provisional certify or uncertify for provisional forms", () => {
    renderWithStatus("state", ProvisionalCertifiedStatusFields());
    expect(screen.getByText("Certify & Submit Provisional Data", { selector: "button" })).toBeDisabled();
    expect(screen.getByText("Certify & Submit Final Data", { selector: "button" })).not.toBeDisabled();
    expect(screen.queryByText("Uncertify", { selector: "button" })).not.toBeInTheDocument();
  });

  it("should allow uncertify, but not certify for final forms", () => {
    renderWithStatus("state", FinalCertifiedStatusFields());
    expect(screen.getByText("Certify & Submit Provisional Data", { selector: "button" })).toBeDisabled();
    expect(screen.getByText("Certify & Submit Final Data", { selector: "button" })).toBeDisabled();
    expect(screen.queryByText("Uncertify", { selector: "button" })).toBeInTheDocument();
  });

  it("should display correct certify text for in-progress forms", () => {
    renderWithStatus("state", InProgressStatusFields());
    const expectedText = "Ready to certify?";
    const certifyElement = screen.getByTestId("certificationText");
    expect(certifyElement).toHaveTextContent(expectedText);
  });

  it("should display correct certify text for provisional forms", () => {
    renderWithStatus("state", ProvisionalCertifiedStatusFields());
    const expectedText = "Ready to final certify?";
    const certifyElement = screen.getByTestId("certificationText");
    expect(certifyElement).toHaveTextContent(expectedText);
  });

  it("should display correct certify text for final", () => {
    renderWithStatus("state", FinalCertifiedStatusFields());
    const expectedText = "Thank you for submitting your SEDS data!";
    const certifyElement = screen.getByTestId("certificationText");
    expect(certifyElement).toHaveTextContent(expectedText);
  });

  it("should save the updated status for provisional certify", async () => {
    renderWithStatus("state", InProgressStatusFields());

    const provCertButton = screen.getByRole(
      "button",
      { name: "Certify & Submit Provisional Data" }
    );
    userEvent.click(provCertButton);

    expect(updateFormStatus).toHaveBeenCalledWith(ProvisionalCertifiedStatusFields().status_id);
    await waitFor(() => expect(saveForm).toHaveBeenCalled());
  });

  it("should save the updated status for final certify", async () => {
    renderWithStatus("state", ProvisionalCertifiedStatusFields());
    const finalCertButton = screen.getByRole(
      "button",
      { name: "Certify & Submit Final Data" }
    );
    userEvent.click(finalCertButton);

    expect(updateFormStatus).toHaveBeenCalledWith(FinalCertifiedStatusFields().status_id);
    await waitFor(() => expect(saveForm).toHaveBeenCalled());
  });

  it("should save the updated status for uncertify", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    renderWithStatus("state", FinalCertifiedStatusFields());
    const uncertifyButton = screen.getByRole("button", { name: "Uncertify" });
    userEvent.click(uncertifyButton);

    expect(updateFormStatus).toHaveBeenCalledWith(InProgressStatusFields().status_id);
    await waitFor(() => expect(saveForm).toHaveBeenCalled());
  });

  it("should not uncertify if the user does not confirm", async () => {
    const conf = vi.spyOn(window, "confirm").mockReturnValueOnce(false);

    renderWithStatus("state", FinalCertifiedStatusFields());
    const uncertifyButton = screen.getByRole("button", { name: "Uncertify" });
    userEvent.click(uncertifyButton);

    expect(conf).toHaveBeenCalledWith(expect.stringContaining("Are you sure"));
    expect(updateFormStatus).not.toHaveBeenCalled();
    expect(saveForm).not.toHaveBeenCalled();
  });
});
