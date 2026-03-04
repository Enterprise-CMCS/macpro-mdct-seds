import { describe, expect, it } from "vitest";
import { stateList } from "./stateList.ts";

describe("state list", () => {
  it("should include all states, plus DC, but not territories", () => {
    expect(stateList.length).toBe(51);
    expect(stateList.find((s) => s.state_id === "DC")).toBeTruthy();
    expect(stateList.find((s) => s.state_id === "PR")).toBeFalsy();
  });

  it("should include state abbreviations and names", () => {
    expect(stateList.find((s) => s.state_id === "IA")!.state_name).toBe("Iowa");
  });
});
