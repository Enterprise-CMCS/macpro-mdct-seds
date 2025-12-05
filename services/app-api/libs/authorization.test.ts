import { beforeEach, describe, expect, it, vi } from "vitest";
import { getUserDetailsFromEvent } from "./authorization.ts";
import { jwtDecode } from "jwt-decode";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

const mockEvent = {
  headers: {
    "x-api-key": "mockApiKey",
  },
  requestContext: {
    accountId: "123",
  },
};

const mockToken = {
  email: "stateuserCO@test.com",
  given_name: "Cheryl",
  family_name: "O'Lorry'",
  sub: "0000-1111-2222-3333",
  identities: [{ userId: "COLO" }],
  "custom:ismemberof": "CHIP_P_USER_GROUP",
};
jwtDecode.mockReturnValue(mockToken);

describe("authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserDetailsFromEvent", () => {
    it("should build a user object from values in the token", async () => {
      const result = await getUserDetailsFromEvent(mockEvent);

      expect(result).toEqual({
        email: "stateuserCO@test.com",
        firstName: "Cheryl",
        lastName: "O'Lorry'",
        role: "state",
        username: "COLO",
        usernameSub: "0000-1111-2222-3333",
      });

      expect(jwtDecode).toHaveBeenCalledWith("mockApiKey");
    });

    it("should map job codes to user roles correctly", async () => {
      const expectMembershipToHaveRole = async (membership, role) => {
        jwtDecode.mockReturnValueOnce({
          ...mockToken,
          "custom:ismemberof": membership,
        });
        const result = await getUserDetailsFromEvent(mockEvent);
        expect(result.role).toBe(role);
      };

      await expectMembershipToHaveRole("CHIP_D_USER_GROUP_ADMIN", "admin");
      await expectMembershipToHaveRole("CHIP_V_USER_GROUP_ADMIN", "admin");
      await expectMembershipToHaveRole("CHIP_P_USER_GROUP_ADMIN", "admin");
      await expectMembershipToHaveRole("CHIP_D_USER_GROUP", "state");
      await expectMembershipToHaveRole("CHIP_V_USER_GROUP", "state");
      await expectMembershipToHaveRole("CHIP_P_USER_GROUP", "state");

      // The membership attribute often contains multiple job codes
      await expectMembershipToHaveRole(
        "foo,CHIP_P_USER_GROUP_ADMIN,bar",
        "admin"
      );
      await expectMembershipToHaveRole("foo,CHIP_P_USER_GROUP,bar", "state");
    });

    it("should throw if role cannot be determined", async () => {
      jwtDecode.mockReturnValueOnce({
        ...mockToken,
        "custom:ismemberof": "invalid test value",
      });
      await expect(getUserDetailsFromEvent(mockEvent)).rejects.toThrow(
        "request a Job Code"
      );
    });

    it("should use email as username if EUA ID cannot be found", async () => {
      jwtDecode.mockReturnValueOnce({
        ...mockToken,
        identities: [],
      });

      const result = await getUserDetailsFromEvent(mockEvent);

      expect(result.username).toBe(mockToken.email);
    });
  });
});
