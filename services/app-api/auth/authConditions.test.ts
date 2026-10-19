import { describe, expect, it } from "vitest";
import {
  canReadDataForState,
  canWriteStatusForState,
  canWriteAnswersForState,
} from "./authConditions.ts";
import { AuthUser } from "../storage/users.ts";

const stateUserCO = {
  email: "stateuserCO@test.com",
  role: "state",
  state: "CO",
} as AuthUser;

const stateUserTX = {
  email: "stateuserTX@test.com",
  role: "state",
  state: "TX",
} as AuthUser;

const adminUser = {
  email: "adminuser@test.com",
  role: "admin",
} as AuthUser;

const businessUser = {
  email: "businessuser@test.com",
  role: "business",
} as AuthUser;

describe("authConditions", () => {
  describe("canReadDataForState", () => {
    it.each([
      { user: adminUser, name: "admin", expected: true },
      { user: businessUser, name: "business", expected: true },
      { user: stateUserCO, name: "(same) state", expected: true },
      { user: stateUserTX, name: "(other) state", expected: false },
    ])("should return $expected for $name user", ({ user, expected }) => {
      expect(canReadDataForState(user, "CO")).toBe(expected);
    });
  });

  describe("canWriteStatusForState", () => {
    it.each([
      { user: adminUser, name: "admin", expected: false },
      { user: businessUser, name: "business", expected: true },
      { user: stateUserCO, name: "(same) state", expected: true },
      { user: stateUserTX, name: "(other) state", expected: false },
    ])("should return $expected for $name user", ({ user, expected }) => {
      expect(canWriteStatusForState(user, "CO")).toBe(expected);
    });
  });

  describe("canWriteAnswersForState", () => {
    it.each([
      { user: adminUser, name: "admin", expected: false },
      { user: businessUser, name: "business", expected: false },
      { user: stateUserCO, name: "(same) state", expected: true },
      { user: stateUserTX, name: "(other) state", expected: false },
    ])("should return $expected for $name user", ({ user, expected }) => {
      expect(canWriteAnswersForState(user, "CO")).toBe(expected);
    });
  });
});
