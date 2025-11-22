import { beforeEach, describe, expect, it, vi } from "vitest";
import { scanFormsByQuarterAndStatus } from "./stateForms.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockFormCO21E = { state_id: "CO", form: "21E" };
const mockFormCOGRE = { state_id: "CO", form: "GRE" };
const mockFormTX21E = { state_id: "TX", form: "21E" };

describe("State Form storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanFormsByQuarterAndStatus", () => {
    it("should fetch forms from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [mockFormCO21E, mockFormCOGRE, mockFormTX21E],
      });

      const result = await scanFormsByQuarterAndStatus(2025, 4, 1);

      expect(result).toEqual([mockFormCO21E, mockFormCOGRE, mockFormTX21E]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-state-forms",
        FilterExpression: "#year = :year AND quarter = :quarter AND status_id = :status_id",
        ExpressionAttributeNames: { "#year": "year" },
        ExpressionAttributeValues: {
          ":year": 2025,
          ":quarter": 4,
          ":status_id": 1,
        },
      }), expect.any(Function));
    });
  });
});
