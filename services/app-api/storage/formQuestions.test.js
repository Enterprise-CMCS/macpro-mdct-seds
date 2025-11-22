import { beforeEach, describe, expect, it, vi } from "vitest";
import { scanQuestionsByYear } from "./formQuestions.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockQuestion1 = { question: "Q1" };
const mockQuestion2 = { question: "Q2" };

describe("Form Question storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanQuestionsByYear", () => {
    it("should query questions from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockQuestion1, mockQuestion2],
      });

      const result = await scanQuestionsByYear(2025);

      expect(result).toEqual([mockQuestion1, mockQuestion2]);
      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-questions",
        FilterExpression: "#year = :year",
        ExpressionAttributeNames: { "#year": "year" },
        ExpressionAttributeValues: { ":year": 2025 },
      }), expect.any(Function));
    });
  });
});
