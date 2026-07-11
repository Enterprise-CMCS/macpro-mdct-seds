import { beforeEach, describe, expect, it, vi } from "vitest";
import AppRoutes from "./AppRoutes";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { useStore } from "../../store/store";
import { getForm as actualGetForm } from "libs/api";

vi.mock("../../libs/api", () => ({
  getForm: vi.fn(),
  listFormsForQuarter: vi.fn().mockResolvedValue([]),
  listFormsForState: vi.fn().mockResolvedValue([]),
  listTemplateYears: vi.fn().mockResolvedValue([]),
  listUsers: vi.fn().mockResolvedValue([]),
}));
const getForm = vi.mocked(actualGetForm);
getForm.mockResolvedValue({
  answers: [{ rows: [{ col6: "" }] }],
  questions: [],
  statusData: {
    state_comments: [{ entry: "" }],
  },
});

describe("App Router", () => {
  describe("For users who are not logged in", () => {
    beforeEach(() => {
      useStore.setState({ user: {} });
    });

    it.each([
      { route: "/login", text: /Login with EUA/ },
      { route: "/unauthorized", text: /not authorized/ },
    ])("should have route $route", ({ route, text }) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(text)).toBeVisible();
    });

    it.each([
      "/",
      "/register-state",
      "/profile",
      "/forms/CO/2026/1",
      "/forms/CO/2026/1/21E",
      "/print/CO/2026/1/21E",
      "/users",
      "/users/42/edit",
      "/form-templates",
      "/generate-forms",
      "/generate-counts",
    ])("should redirect from route %s to Login", (route) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/Login with EUA/)).toBeVisible();
    });

    it("should redirect other routes to Not Found", () => {
      render(
        <MemoryRouter initialEntries={["/non-existent"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/not found/)).toBeVisible();
    });
  });

  describe("For state users", () => {
    beforeEach(() => {
      useStore.setState({ user: { role: "state", state: "CO" } });
    });

    it.each([
      { route: "/login", text: /Login with EUA/ },
      { route: "/unauthorized", text: /not authorized/ },
      { route: "/profile", text: /Profile/ },
      { route: "/forms/CO/2026/1", text: /Q1 2026 Reports/ },
      { route: "/forms/CO/2026/1/21E", text: /Does this form apply/ },
      { route: "/print/CO/2026/1/21E", text: "Print / PDF" },
    ])("should have route $route", async ({ route, text }) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(await screen.findByText(text)).toBeVisible();
    });

    it("should show state home page when user has a state", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/Welcome to SEDS.*view available/)).toBeVisible();
    });

    it("should redirect to state selector when user has no state", () => {
      const userWithNoState = { role: "state" };
      useStore.setState({ user: userWithNoState });
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/select your state/)).toBeVisible();
    });

    it.each([
      "/users",
      "/users/42/edit",
      "/form-templates",
      "/generate-forms",
      "/generate-counts",
    ])("should redirect from route %s to Unauthorized", (route) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/not authorized/)).toBeVisible();
    });

    it("should redirect other routes to Not Found", () => {
      render(
        <MemoryRouter initialEntries={["/non-existent"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/not found/)).toBeVisible();
    });
  });

  describe("For business users", () => {
    beforeEach(() => {
      useStore.setState({ user: { role: "business" } });
    });

    it.each([
      { route: "/login", text: /Login with EUA/ },
      { route: "/unauthorized", text: /not authorized/ },
      { route: "/profile", text: /Profile/ },
      { route: "/forms/CO/2026/1", text: /Q1 2026 Reports/ },
      { route: "/forms/CO/2026/1/21E", text: /Does this form apply/ },
      { route: "/print/CO/2026/1/21E", text: "Print / PDF" },
    ])("should have route $route", async ({ route, text }) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(await screen.findByText(text)).toBeVisible();
    });

    it("should show business home page", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/Home Business User Page/)).toBeVisible();
    });

    it.each([
      "/users",
      "/users/42/edit",
      "/form-templates",
      "/generate-forms",
      "/generate-counts",
    ])("should redirect from route %s to Unauthorized", (route) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/not authorized/)).toBeVisible();
    });

    it("should redirect other routes to Not Found", () => {
      render(
        <MemoryRouter initialEntries={["/non-existent"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/not found/)).toBeVisible();
    });
  });

  describe("For admin users", () => {
    beforeEach(() => {
      useStore.setState({ user: { role: "admin" } });
    });

    it.each([
      { route: "/login", text: /Login with EUA/ },
      { route: "/unauthorized", text: /not authorized/ },
      { route: "/profile", text: /Profile/ },
      { route: "/forms/CO/2026/1", text: /Q1 2026 Reports/ },
      { route: "/forms/CO/2026/1/21E", text: /Does this form apply/ },
      { route: "/print/CO/2026/1/21E", text: "Print / PDF" },
      { route: "/users", text: "Users" },
      { route: "/users/42/edit", text: "Edit User" },
      { route: "/form-templates", text: "Add/Edit Form Templates" },
      { route: "/generate-forms", text: "Generate Quarterly Forms" },
      { route: "/generate-counts", text: "Generate Enrollment Totals" },
    ])("should have route $route", async ({ route, text }) => {
      render(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );

      expect(await screen.findByText(text)).toBeVisible();
    });

    it("should show admin home page", () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/Home Admin User Page/)).toBeVisible();
    });

    it("should redirect other routes to Not Found", () => {
      render(
        <MemoryRouter initialEntries={["/non-existent"]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(screen.getByText(/not found/)).toBeVisible();
    });
  });
});
