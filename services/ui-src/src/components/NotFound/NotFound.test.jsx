import React from "react";
import NotFound from "./NotFound";
import { render, screen } from "@testing-library/react";

describe("Test NotFound.js", () => {
  it("should render", () => {
    render(<NotFound/>);
    expect(screen.getByText("page not found", { exact: false })).toBeInTheDocument();
  });
});
