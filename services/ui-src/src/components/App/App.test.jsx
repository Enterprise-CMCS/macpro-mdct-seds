import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ensureUserExistsInApi } from "../../utility-functions/initialLoadFunctions";
import { fireTealiumPageView } from "../../utility-functions/tealium";

vi.mock("../Routes/Routes", () => ({
  default: props => <div data-testid="routes">{JSON.stringify(props)}</div>
}));

vi.mock("react-router-dom", async importOriginal => ({
  ...(await importOriginal()),
  useLocation: () => ({
    pathname: "localhost:3000/example/path"
  })
}));

vi.mock("aws-amplify", () => ({
  Auth: {
    currentSession: vi.fn().mockResolvedValue({
      getIdToken: vi.fn().mockReturnValue({
        payload: {
          email: "qwer@email.test"
        }
      })
    })
  }
}));

vi.mock("../../utility-functions/initialLoadFunctions", () => ({
  ensureUserExistsInApi: vi.fn().mockResolvedValue({
    attributes: {
      role: "state"
    }
  })
}));

vi.mock("../../utility-functions/tealium", () => ({
  fireTealiumPageView: vi.fn()
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe("Test App.js", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should record analytics for authenticated page views", async () => {
    renderComponent();

    await waitFor(() => {
      expect(ensureUserExistsInApi).toHaveBeenCalledWith("qwer@email.test");
      expect(fireTealiumPageView).toHaveBeenCalledWith(
        true,
        "http://localhost:3000/",
        "localhost:3000/example/path"
      );
    });

    // Header is present
    expect(
      screen.getByText("An official website of the United States government")
    ).toBeInTheDocument();

    // Footer is present
    expect(
      screen.getByText("7500 Security Boulevard Baltimore, MD 21244")
    ).toBeInTheDocument();
  });

  it("should record analytics for unauthenticated page views", async () => {
    ensureUserExistsInApi.mockRejectedValue("oh no a error");

    renderComponent();

    await waitFor(() => {
      expect(ensureUserExistsInApi).toHaveBeenCalledWith("qwer@email.test");
      expect(fireTealiumPageView).toHaveBeenCalledWith(
        false, // not authenticated
        "http://localhost:3000/", // we've been redirected
        "localhost:3000/example/path"
      );
    });

    // Header is present
    expect(
      screen.getByText("An official website of the United States government")
    ).toBeInTheDocument();

    // Footer is present
    expect(
      screen.getByText("7500 Security Boulevard Baltimore, MD 21244")
    ).toBeInTheDocument();
  });
});
