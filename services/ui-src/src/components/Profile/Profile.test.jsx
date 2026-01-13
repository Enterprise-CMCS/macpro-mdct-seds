import React from "react";
import { describe, expect, it } from "vitest";
import Profile from "./Profile";
import { render, screen } from "@testing-library/react";
import { useStore } from "../../store/store";

const renderComponent = () => {
  useStore.setState({
    user: {
      email: "ben@example.com",
      firstName: "Ben",
      lastName: "Martin",
      role: "state",
      state: "CO",
    }
  });
  return render(<Profile/>);
}

describe("Test SummaryTab.js", () => {
  it("should render appropriate inputs, disabled, with correct values", async () => {
    renderComponent();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Email").value).toBe("ben@example.com");

    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("First Name")).toBeDisabled();
    expect(screen.getByLabelText("First Name").value).toBe("Ben");

    expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last Name")).toBeDisabled();
    expect(screen.getByLabelText("Last Name").value).toBe("Martin");

    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeDisabled();
    expect(screen.getByLabelText("Role").value).toBe("State");

    expect(screen.getByLabelText("State")).toBeInTheDocument();
    expect(screen.getByLabelText("State")).toBeDisabled();
    expect(screen.getByLabelText("State").value).toBe("CO");
  });
});
