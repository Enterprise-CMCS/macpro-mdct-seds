import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotApplicable from "./NotApplicable";
import { BrowserRouter } from "react-router-dom";
import {
  FinalCertifiedStatusFields,
  InProgressStatusFields,
  NotRequiredStatusFields,
  ProvisionalCertifiedStatusFields,
} from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

const renderComponent = (role, statusData) => {
  useStore.setState({
    user: { role },
    statusData,
    wipeForm: vi.fn(),
    saveForm: vi.fn(),
    updateFormStatus: vi.fn(),
  });
  return render(
    <BrowserRouter>
      <NotApplicable/>
    </BrowserRouter>
  );
};

describe("NotApplicable", () => {
  it("should be enabled for state users viewing an in-progress form", async () => {
    renderComponent("state", InProgressStatusFields());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeEnabled();
    expect(noButton).toBeEnabled();
  });

  it("should be disabled for admin users", async () => {
    renderComponent("admin", InProgressStatusFields());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });

  it("should be disabled for state users viewing a certified form", async () => {
    renderComponent("state", FinalCertifiedStatusFields());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    const noButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeDisabled();
    expect(noButton).toBeDisabled();
  });

  it("should initialize to Active when applicable", async () => {
    renderComponent("state", InProgressStatusFields());
    const yesButton = screen.getByRole("radio", { name: "Yes" });
    expect(yesButton).toBeChecked();
  });

  it("should initialize to Yes for a Certified form", async () => {
    renderComponent("state", ProvisionalCertifiedStatusFields());
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    expect(yesOption).toBeChecked();
  });

  it("should initialize to Not Applicable when appropriate", async () => {
    renderComponent("state", NotRequiredStatusFields());
    const yesButton = screen.getByRole("radio", { name: "No" });
    expect(yesButton).toBeChecked();
  });
});
