import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import NotApplicable from "./NotApplicable";
import { BrowserRouter } from "react-router-dom";
import {
  FinalCertifiedStatusFields,
  InProgressStatusFields,
  NotRequiredStatusFields,
  ProvisionalCertifiedStatusFields,
} from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";
import userEvent from "@testing-library/user-event";

const wipeForm = vi.fn();
const updateFormStatus = vi.fn();
const saveForm = vi.fn();

const renderComponent = (role, statusData) => {
  useStore.setState({
    user: { role },
    statusData,
    wipeForm,
    saveForm,
    updateFormStatus,
  });
  return render(
    <BrowserRouter>
      <NotApplicable/>
    </BrowserRouter>
  );
};

describe("NotApplicable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    const noOption = screen.getByRole("radio", { name: "No" });
    expect(noOption).toBeChecked();
  });

  it("should save the form when it moves to Applicable", async () => {
    renderComponent("state", NotRequiredStatusFields());
    
    const yesOption = screen.getByRole("radio", { name: "Yes" });
    userEvent.click(yesOption);

    expect(updateFormStatus).toHaveBeenCalledWith(InProgressStatusFields().status_id);
    await waitFor(() => expect(saveForm).toHaveBeenCalled());
  });

  it("should save the form when it moves to Not Applicable", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    renderComponent("state", ProvisionalCertifiedStatusFields());

    const noOption = screen.getByRole("radio", { name: "No" });
    userEvent.click(noOption);

    expect(wipeForm).toHaveBeenCalled();
    expect(updateFormStatus).toHaveBeenCalledWith(NotRequiredStatusFields().status_id);
    await waitFor(() => expect(saveForm).toHaveBeenCalled());
  });
  
  it("should not wipe the form if the user does not confirm", async () => {
    const conf = vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    renderComponent("state", ProvisionalCertifiedStatusFields());

    const noOption = screen.getByRole("radio", { name: "No" });
    userEvent.click(noOption);
    
    await waitFor(() =>
      expect(conf).toHaveBeenCalledWith(expect.stringContaining("Are you sure"))
    );
    expect(updateFormStatus).not.toHaveBeenCalled();
    expect(saveForm).not.toHaveBeenCalled();
  });
});
