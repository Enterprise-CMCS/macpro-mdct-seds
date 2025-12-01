import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FormFooter from "./FormFooter";
import { BrowserRouter } from "react-router-dom";
import { useStore } from "../../store/store";

const mockUser = {
  Items: [
    {
      status: "success",
      email: "email@email.com",
      name: "Test User",
      states: ["CA"],
      role: "state"
    }
  ]
};

vi.mock("../../utility-functions/userFunctions", () => ({
  getUserInfo: () => Promise.resolve(mockUser)
}));

describe("Test FormFooter.js", () => {
  beforeEach(() => {
    useStore.setState({
      statusData: { last_modified: "2025-11-26T22:45:38.115Z" }
    })
    render(
      <BrowserRouter>
        <FormFooter state="AL" year="2021" quarter="1" />
      </BrowserRouter>
    );
  });

  test("Check for Link back to Quarter Page list of available reports", () => {
    expect(screen.getByText("Back to Q1 2021")).toBeInTheDocument();
  });

  test("Check for Last Saved Date display", () => {
    expect(screen.getByTestId("lastModified"))
      .toHaveTextContent("Last saved: 11/26/2025 at 5:45:38 PM EST");
  });

  test("Check for Save button", () => {
    const saveButton = screen.getByText("Save", { selector: "button" })
    expect(saveButton).toBeInTheDocument();
  });
});
