import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormFooter from "./FormFooter";
import { BrowserRouter } from "react-router-dom";
import { useStore } from "../../store/store";

const renderComponent = (role) => {
    useStore.setState({
      user: { role },
      statusData: { last_modified: "2025-11-26T22:45:38.115Z" },
      saveForm: vi.fn(),
    })
    render(
      <BrowserRouter>
        <FormFooter state="AL" year="2021" quarter="1" />
      </BrowserRouter>
    );
}

describe("Test FormFooter.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    renderComponent("state");

    expect(screen.getByRole("link", { name: "Back to Q1 2021" })).toBeVisible();
    expect(screen.getByText(
      "Last saved: 11/26/2025 at 5:45:38 PM EST"
    )).toBeVisible();
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
  });

  it("should disable the save button for admin users", () => {
    renderComponent("admin");
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("should save the form when a state user clicks Save", () => {
    renderComponent("state");
    userEvent.click((screen.getByRole("button", { name: "Save" })));
    expect(useStore.getState().saveForm).toHaveBeenCalled();
  });
});
