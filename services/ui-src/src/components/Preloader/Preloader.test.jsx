import React from "react";
import Preloader from "./Preloader";
import { render } from "@testing-library/react";

describe("Test Preloader.js", () => {
  it("should render some entrancing animated .gif files", () => {
    const { container } = render(<Preloader />);
    const gifs = [...container.querySelectorAll("img[src*='.gif']")];
    expect(gifs.length).toBe(1);
  });
});
