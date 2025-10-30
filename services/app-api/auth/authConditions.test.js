import { describe, expect, test, vi } from "vitest";
import {
  authorizeAdmin,
  authorizeAnyUser,
  authorizeAdminOrUserWithEmail,
  authorizeAdminOrUserForState,
  authorizeUserForState,
  authorizeStateUser,
} from "./authConditions.js";
import { getCurrentUserInfo } from "./cognito-auth.js";

vi.mock("./cognito-auth.js", () => ({
  getCurrentUserInfo: vi.fn(),
}));

const mockEvent = {};

const stateUserCO = {
  email: "stateuserCO@test.com",
  role: "state",
  states: ["CO"],
};

const stateUserTX = {
  email: "stateuserTX@test.com",
  role: "state",
  states: ["TX"],
};

const adminUser = {
  email: "adminuser@test.com",
  role: "admin",
  states: [],
};

const businessUser = {
  email: "businessuser@test.com",
  role: "business",
  states: ["CO", "TX", "etc"],
};

const assertAllow = async (authCall, user) => {
  getCurrentUserInfo.mockResolvedValueOnce({ data: user });
  await expect(authCall()).resolves.not.toThrow();
};

const assertDeny = async (authCall, user) => {
  getCurrentUserInfo.mockResolvedValueOnce({ data: user });
  await expect(authCall()).rejects.toThrow("Forbidden");
};

describe("authConditions", () => {
  test("authorizeAnyUser should allow the expected users", async () => {
    const authCall = () => authorizeAnyUser(mockEvent);
    await assertAllow(authCall, adminUser);
    await assertAllow(authCall, businessUser);
    await assertAllow(authCall, stateUserCO);
    await assertAllow(authCall, stateUserTX);
  });

  test("authorizeAnyUser should reject when a user cannot be found", async () => {
    getCurrentUserInfo.mockResolvedValueOnce(undefined);
    await expect(authorizeAnyUser(mockEvent)).rejects.toThrow();

    getCurrentUserInfo.mockResolvedValueOnce({ data: {} });
    await expect(authorizeAnyUser(mockEvent)).rejects.toThrow();
  });

  test("authorizeAnyUser should reject token decoding fails", async () => {
    getCurrentUserInfo.mockImplementationOnce(() => {
      throw new Error();
    });
    await expect(authorizeAnyUser(mockEvent)).rejects.toThrow();
  });

  test("authorizeAdmin should allow the expected users", async () => {
    const authCall = () => authorizeAdmin(mockEvent);
    await assertAllow(authCall, adminUser);
    await assertDeny(authCall, businessUser);
    await assertDeny(authCall, stateUserCO);
    await assertDeny(authCall, stateUserTX);
  });

  test("authorizeAdminOrUserWithEmail should allow the expected users", async () => {
    const authCall = () =>
      authorizeAdminOrUserWithEmail(mockEvent, "stateuserCO@test.com");
    await assertAllow(authCall, adminUser);
    await assertDeny(authCall, businessUser);
    await assertAllow(authCall, stateUserCO);
    await assertDeny(authCall, stateUserTX);
  });

  test("authorizeAdminOrUserForState should allow the expected users", async () => {
    const authCall = () => authorizeAdminOrUserForState(mockEvent, "CO");
    await assertAllow(authCall, adminUser);
    await assertAllow(authCall, businessUser);
    await assertAllow(authCall, stateUserCO);
    await assertDeny(authCall, stateUserTX);
  });

  test("authorizeStateUser should allow the expected users", async () => {
    const authCall = () => authorizeStateUser(mockEvent, "CO");
    await assertDeny(authCall, adminUser);
    await assertDeny(authCall, businessUser);
    await assertAllow(authCall, stateUserCO);
    await assertDeny(authCall, stateUserTX);
  });

  test("authorizeUserForState should allow the expected users", async () => {
    const authCall = () => authorizeUserForState(mockEvent, "CO");
    await assertDeny(authCall, adminUser);
    await assertAllow(authCall, businessUser);
    await assertAllow(authCall, stateUserCO);
    await assertDeny(authCall, stateUserTX);
  });
});
