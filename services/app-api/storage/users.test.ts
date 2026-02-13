import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AuthUser,
  putUser,
  scanForUserByUsername,
  scanForUserWithSub,
  scanUsersByRole,
} from "./users.ts";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);
const mockPut = vi.fn();
mockDynamo.on(PutCommand).callsFake(mockPut);

const mockUserCO = { state: "CO", email: "stateuserCO@test.com" } as AuthUser;
const mockUserTX = { state: "TX", email: "stateuserTX@test.com" } as AuthUser;

describe("User storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("putUser", () => {
    it("should save user info to dynamo", async () => {
      await putUser(mockUserCO);

      expect(mockPut).toHaveBeenCalledWith(
        {
          TableName: "local-auth-user",
          Item: mockUserCO,
        },
        expect.any(Function)
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
        }),
        expect.any(Function)
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
        }),
        expect.any(Function)
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
        }),
        expect.any(Function)
      );
    });
  });
});
