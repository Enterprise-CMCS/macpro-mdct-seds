import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockBatchWrite, mockScan } from "../libs/dynamo-mocking.ts";
import {
  FormQuestion,
  scanQuestionsByYear,
  scanQuestionsByYearAndForm,
  writeAllFormQuestions,
} from "./formQuestions.ts";

const mockQuestion1 = { question: "Q1" } as FormQuestion;
const mockQuestion2 = { question: "Q2" } as FormQuestion;

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
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-form-questions",
          FilterExpression: "#year = :year",
          ExpressionAttributeNames: { "#year": "year" },
          ExpressionAttributeValues: { ":year": 2025 },
        })
      );
    });
  });

  describe("scanQuestionsByYearAndForm", () => {
    it("should query questions from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockQuestion1, mockQuestion2],
      });

      const result = await scanQuestionsByYearAndForm(2025, "21E");

      expect(result).toEqual([mockQuestion1, mockQuestion2]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-form-questions",
          FilterExpression: "#year = :year AND form = :form",
          ExpressionAttributeNames: { "#year": "year" },
          ExpressionAttributeValues: { ":year": 2025, ":form": "21E" },
        })
      );
    });
  });

  describe("writeAllFormQuestions", () => {
    it("should write objects to dynamo", async () => {
      await writeAllFormQuestions([mockQuestion1, mockQuestion2]);

      expect(mockBatchWrite).toHaveBeenCalledWith({
        RequestItems: {
          "local-form-questions": [
            { PutRequest: { Item: mockQuestion1 } },
            { PutRequest: { Item: mockQuestion2 } },
          ],
        },
      });
    });
  });
});
