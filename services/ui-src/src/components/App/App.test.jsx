import React from "react";
import App from "./App";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    pathname: "localhost:3000/example/path"
  })
}));

describe("Test App.js", () => {
  test("Check the main div, with classname app, exists", () => {
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(container.querySelector(".App")).toBeInTheDocument();
  });
});
