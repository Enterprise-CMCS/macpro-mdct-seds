import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  scanFormsByQuarter,
  scanFormsByQuarterAndStatus,
  StateForm,
  writeAllStateForms,
} from "./stateForms.ts";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockBatchWrite = vi.fn();
mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

mockBatchWrite.mockResolvedValue({});

const mockFormCO21E = { state_id: "CO", form: "21E" } as StateForm;
const mockFormCOGRE = { state_id: "CO", form: "GRE" } as StateForm;
const mockFormTX21E = { state_id: "TX", form: "21E" } as StateForm;

describe("State Form storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanFormsByQuarter", () => {
    it("should fetch forms from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [mockFormCO21E, mockFormCOGRE, mockFormTX21E],
      });

      const result = await scanFormsByQuarter(2025, 4);

      expect(result).toEqual([mockFormCO21E, mockFormCOGRE, mockFormTX21E]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-state-forms",
        FilterExpression: "#year = :year AND quarter = :quarter",
        ExpressionAttributeNames: { "#year": "year" },
        ExpressionAttributeValues: {
          ":year": 2025,
          ":quarter": 4,
        },
      }), expect.any(Function));
    });
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
    
  describe("writeAllStateForms", () => {
    it("should write objects to dynamo", async () => {
      await writeAllStateForms([mockFormCO21E, mockFormCOGRE]);

      expect(mockBatchWrite).toHaveBeenCalledWith({
        RequestItems: {
          "local-state-forms": [
            { PutRequest: { Item: mockFormCO21E } },
            { PutRequest: { Item: mockFormCOGRE } },
          ],
        },
      },
      expect.any(Function));
    });
  });
});
