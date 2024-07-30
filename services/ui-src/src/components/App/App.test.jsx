import React from "react";
import App from "./App";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ensureUserExistsInApi } from "../../utility-functions/initialLoadFunctions";
import { fireTealiumPageView } from "../../utility-functions/tealium";

jest.mock("../Routes/Routes", () =>
  (props) => <div data-testid="routes">{JSON.stringify(props)}</div>
);

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:3000/example/path",
  }),
}));

jest.mock("aws-amplify", () => ({
  Auth: {
    currentSession: jest.fn().mockResolvedValue({
      getIdToken: jest.fn().mockReturnValue({
        payload: {
          email: "qwer@email.test",
        },
      }),
    }),
  },
}));

jest.mock("../../utility-functions/initialLoadFunctions", () => ({
  ensureUserExistsInApi: jest.fn().mockResolvedValue({
    attributes: {
      role: "state",
    },
  }),
}));

jest.mock("../../utility-functions/tealium", () => ({
  fireTealiumPageView: jest.fn(),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>    
  );
};

describe("Test App.js", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should record analytics for authenticated page views", async () => {
    renderComponent();

    await waitFor(() => {
      expect(ensureUserExistsInApi).toHaveBeenCalledWith("qwer@email.test");
      expect(fireTealiumPageView).toHaveBeenCalledWith(
        true,
        "http://localhost/",
        "localhost:3000/example/path"
      );
    });

    // Header is present
    expect(screen.getByText(
      "An official website of the United States government"
    )).toBeInTheDocument();

    // Footer is present
    expect(screen.getByText(
      "7500 Security Boulevard Baltimore, MD 21244"
    )).toBeInTheDocument();
  });

  it("should record analytics for unauthenticated page views", async () => {
    ensureUserExistsInApi.mockRejectedValue("oh no a error");

    renderComponent();

    await waitFor(() => {
      expect(ensureUserExistsInApi).toHaveBeenCalledWith("qwer@email.test");
      expect(fireTealiumPageView).toHaveBeenCalledWith(
        false, // not authenticated
        "http://localhost/", // we've been redirected
        "localhost:3000/example/path",
      );
    });

    // Header is present
    expect(screen.getByText(
      "An official website of the United States government"
    )).toBeInTheDocument();

    // Footer is present
    expect(screen.getByText(
      "7500 Security Boulevard Baltimore, MD 21244"
    )).toBeInTheDocument();
  });
});
