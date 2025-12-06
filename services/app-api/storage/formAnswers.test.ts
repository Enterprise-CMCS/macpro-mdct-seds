import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormAnswer, scanForAllFormIds, writeAllFormAnswers } from "./formAnswers.ts";
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

const mockAnswer1 = { state_form: "CO-2025-4-21E" } as FormAnswer;
const mockAnswer2 = { state_form: "CO-2025-4-GRE" } as FormAnswer;

describe("Form Answer storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanForAllFormIds", () => {
    it("should query questions from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockAnswer1, mockAnswer2],
      });

      const result = await scanForAllFormIds();

      expect(result).toEqual(["CO-2025-4-21E", "CO-2025-4-GRE"]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-answers",
        ProjectionExpression: "state_form"
      }), expect.any(Function));
    });
  });

  describe("writeAllFormAnswers", () => {
    it("should write objects to dynamo", async () => {
      await writeAllFormAnswers([mockAnswer1, mockAnswer2]);

      expect(mockBatchWrite).toHaveBeenCalledWith({
        RequestItems: {
          "local-form-answers": [
            { PutRequest: { Item: mockAnswer1 } },
            { PutRequest: { Item: mockAnswer2 } },
          ],
        },
      },
      expect.any(Function));
    });
  });
});
