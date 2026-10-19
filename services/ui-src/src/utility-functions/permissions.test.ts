import { canViewStateData } from "./permissions";
import { describe, expect, it } from "vitest";

describe("canViewState", () => {
  it("should allow admins to view data for any state", () => {
    expect(canViewStateData({ role: "admin" }, "CO")).toBe(true);
  });

  it("should allow business users to view data for any state", () => {
    expect(canViewStateData({ role: "business" }, "CO")).toBe(true);
  });

  it("should allow state users to view data for their state", () => {
    expect(canViewStateData({ role: "state", state: "CO" }, "CO")).toBe(true);
  });

  it("should forbid state users from viewing data for other states", () => {
    expect(canViewStateData({ role: "state", state: "TX" }, "CO")).toBe(false);
  });

  it("should forbid invalid users from viewing data for any state", () => {
    expect(canViewStateData({}, "CO")).toBe(false);
  });
});
