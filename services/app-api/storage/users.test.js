import { beforeEach, describe, expect, it, vi } from "vitest";
import { scanUsersByRole } from "./users.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockUserCO = { states: ["CO"], email: "stateuserCO@test.com" };
const mockUserTX = { states: ["TX"], email: "stateuserTX@test.com" };

describe("User storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanUsersByRole", () => {
    it("should fetch user info from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockUserCO, mockUserTX],
      });

      const result = await scanUsersByRole("state");

      expect(result).toEqual([mockUserCO, mockUserTX]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-auth-user",
        FilterExpression: "#role = :role",
        ExpressionAttributeNames: { "#role": "role" },
        ExpressionAttributeValues: { ":role": "state" },
      }), expect.any(Function));
    });
  });
});
