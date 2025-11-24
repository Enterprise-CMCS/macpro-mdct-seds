import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStatesList } from "./sharedFunctions.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

describe("sharedFunctions.js", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getStatesList", () => {
    it("should query states from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [{ state_id: "CO" }, { state_id: "TX" }],
      });

      const result = await getStatesList();

      expect(result).toEqual([{ state_id: "CO" }, { state_id: "TX" }]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-states",
      }), expect.any(Function));
    });
  });
});
