import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockGet,
  mockPut,
  mockScan,
  mockUpdate,
} from "../libs/dynamo-mocking.ts";
import {
  AuthUser,
  getUser,
  putUser,
  recordLogin,
  scanAllUsers,
  scanForUserByUsername,
  scanForUserWithSub,
  scanUsersByRole,
} from "./users.ts";

const mockUserCO = { state: "CO", email: "stateuserCO@test.com" } as AuthUser;
const mockUserTX = { state: "TX", email: "stateuserTX@test.com" } as AuthUser;

describe("User storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("putUser", () => {
    it("should save user info to dynamo", async () => {
      await putUser(mockUserCO);

      expect(mockPut).toHaveBeenCalledWith({
        TableName: "local-auth-user",
        Item: mockUserCO,
      });
    });
  });

  describe("scanAllUsers", () => {
    it("should fetch users from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockUserCO, mockUserTX],
      });

      const result = await scanAllUsers();

      expect(result).toEqual([mockUserCO, mockUserTX]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-auth-user",
        })
      );
    });
  });

  describe("scanUsersByRole", () => {
    it("should fetch user info from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockUserCO, mockUserTX],
      });

      const result = await scanUsersByRole("state");

      expect(result).toEqual([mockUserCO, mockUserTX]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-auth-user",
          FilterExpression: "#role = :role",
          ExpressionAttributeNames: { "#role": "role" },
          ExpressionAttributeValues: { ":role": "state" },
        })
      );
    });
  });

  describe("scanForUserByUsername", () => {
    it("should fetch user info from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 1,
        Items: [mockUserCO],
      });

      const result = await scanForUserByUsername("COLO");

      expect(result).toEqual(mockUserCO);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-auth-user",
          FilterExpression: "username = :username",
          ExpressionAttributeValues: { ":username": "COLO" },
        })
      );
    });
  });

  describe("scanForUserWithSub", () => {
    it("should fetch user info from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 1,
        Items: [mockUserCO],
      });

      const result = await scanForUserWithSub("mock-sub");

      expect(result).toEqual(mockUserCO);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-auth-user",
          FilterExpression: "usernameSub = :usernameSub",
          ExpressionAttributeValues: { ":usernameSub": "mock-sub" },
        })
      );
    });
  });

  describe("getUser", () => {
    it("should fetch user info from dynamo", async () => {
      mockGet.mockResolvedValueOnce({
        Item: mockUserCO,
      });

      const result = await getUser("123");

      expect(result).toEqual(mockUserCO);
      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-auth-user",
          Key: { userId: "123" },
        })
      );
    });
  });

  describe("recordLogin", () => {
    it("should update user info from dynamo", async () => {
      await recordLogin(
        {
          userId: "123",
          firstName: "mockFirst",
          lastName: "mockLast",
          email: "mock@example.com",
        },
        "2026-05-15T19:22:50.627Z"
      );

      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: "local-auth-user",
        Key: { userId: "123" },
        UpdateExpression:
          "SET firstName = :firstName, lastName = :lastName, email = :email, lastLogin = :lastLogin",
        ExpressionAttributeValues: {
          ":firstName": "mockFirst",
          ":lastName": "mockLast",
          ":email": "mock@example.com",
          ":lastLogin": "2026-05-15T19:22:50.627Z",
        },
      });
    });
  });
});
