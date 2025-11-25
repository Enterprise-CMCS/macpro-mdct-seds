import React from "react";
import { describe, expect, it, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import CertificationTab from "../CertificationTab/CertificationTab";
import CertificationTabMock from "../../provider-mocks/certificationTabMock";
import {
  FinalCertifiedStatusFields,
  InProgressStatusFields,
  ProvisionalCertifiedStatusFields
} from "../../utility-functions/formStatus";
import { getCurrentUser } from "libs/api";

const mockStore = configureStore([]);

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

vi.mock("../../libs/api", () => ({
  getCurrentUser: () => mockUser
}));

const renderWithStatus = (statusData) => {
  const form = JSON.parse(JSON.stringify(CertificationTabMock));
  form.currentForm.statusData = {
    ...form.currentForm.statusData,
    ...statusData,
  };
  const store = mockStore(form);
  return render(
    <Provider store={store}>
      <CertificationTab />
    </Provider>
  );
};

describe("Test CertificationTab.js", () => {
  it("should not display status text for in-progress forms", () => {
    renderWithStatus(InProgressStatusFields());
    expect(screen.queryByTestId("statusText")).not.toBeInTheDocument();
  });

  it("should display status text for provisional forms", () => {
    renderWithStatus(ProvisionalCertifiedStatusFields());
    const expectedText = "This report was updated to Provisional Data Certified and Submitted on 1/15/2021 at 7:46:35 AM EST by Timothy Griesemer";
    const statusElement = screen.getByTestId("statusText");
    expect(statusElement).toHaveTextContent(expectedText);
  });

  it("should display status text for final forms", () => {
    renderWithStatus(FinalCertifiedStatusFields());
    const expectedText = "This report was updated to Final Data Certified and Submitted on 1/15/2021 at 7:46:35 AM EST by Timothy Griesemer";
    const statusElement = screen.getByTestId("statusText");
    expect(statusElement).toHaveTextContent(expectedText);
  })

  it("should allow certify, but not uncertify for in-progress forms", () => {
    renderWithStatus(InProgressStatusFields());
    expect(screen.getByText("Certify & Submit Provisional Data", { selector: "button" })).not.toBeDisabled();
    expect(screen.getByText("Certify & Submit Final Data", { selector: "button" })).not.toBeDisabled();
    expect(screen.queryByText("Uncertify", { selector: "button" })).not.toBeInTheDocument();
  });

  it("should allow final certify, but not provisional certify or uncertify for provisional forms", () => {
    renderWithStatus(ProvisionalCertifiedStatusFields());
    expect(screen.getByText("Certify & Submit Provisional Data", { selector: "button" })).toBeDisabled();
    expect(screen.getByText("Certify & Submit Final Data", { selector: "button" })).not.toBeDisabled();
    expect(screen.queryByText("Uncertify", { selector: "button" })).not.toBeInTheDocument();
  });

  it("should allow uncertify, but not certify for final forms", () => {
    renderWithStatus(FinalCertifiedStatusFields());
    expect(screen.getByText("Certify & Submit Provisional Data", { selector: "button" })).toBeDisabled();
    expect(screen.getByText("Certify & Submit Final Data", { selector: "button" })).toBeDisabled();
    expect(screen.queryByText("Uncertify", { selector: "button" })).toBeInTheDocument();
  });

  test("should display correct certify text for in-progress forms", () => {
    renderWithStatus(InProgressStatusFields());
    const expectedText = "Ready to certify?";
    const certifyElement = screen.getByTestId("certificationText");
    expect(certifyElement).toHaveTextContent(expectedText);
  });

  test("should display correct certify text for provisional forms", () => {
    renderWithStatus(ProvisionalCertifiedStatusFields());
    const expectedText = "Ready to final certify?";
    const certifyElement = screen.getByTestId("certificationText");
    expect(certifyElement).toHaveTextContent(expectedText);
  });

  test("should display correct certify text for final", () => {
    renderWithStatus(FinalCertifiedStatusFields());
    const expectedText = "Thank you for submitting your SEDS data!";
    const certifyElement = screen.getByTestId("certificationText");
    expect(certifyElement).toHaveTextContent(expectedText);
  });
});
