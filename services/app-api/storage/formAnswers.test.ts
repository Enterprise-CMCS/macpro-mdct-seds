import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockBatchWrite,
  mockQuery,
  mockScan,
  mockUpdate,
} from "../libs/dynamo-mocking.ts";
import {
  FormAnswer,
  queryAnswersByEntry,
  queryAnswersByForm,
  scanForAllFormIds,
  updateAnswer,
  writeAllFormAnswers,
} from "./formAnswers.ts";

const mockAnswer1 = {
  state_form: "CO-2025-4-21E",
  answer_entry: "CO-2025-4-21E-0518-03",
} as FormAnswer;
const mockAnswer2 = {
  state_form: "CO-2025-4-GRE",
  answer_entry: "CO-2025-4-GRE-0105-02",
} as FormAnswer;

describe("Form Answer storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("queryAnswersByEntry", () => {
    it("should query answers from dynamo", async () => {
      mockQuery.mockResolvedValueOnce({ Items: [mockAnswer1] });

      const result = await queryAnswersByEntry("CO-2025-4-21E-0518-03");

      expect(result).toEqual([mockAnswer1]);
      expect(mockQuery).toHaveBeenCalledWith({
        TableName: "local-form-answers",
        KeyConditionExpression: "answer_entry = :answer_entry",
        ExpressionAttributeValues: { ":answer_entry": "CO-2025-4-21E-0518-03" },
      });
    });
  });

  describe("queryAnswersByForm", () => {
    it("should query answers from dynamo", async () => {
      mockQuery.mockResolvedValueOnce({ Items: [mockAnswer1] });

      const result = await queryAnswersByForm("CO-2025-4-21E");

      expect(result).toEqual([mockAnswer1]);
      expect(mockQuery).toHaveBeenCalledWith({
        TableName: "local-form-answers",
        IndexName: "state-form-index",
        KeyConditionExpression: "state_form = :state_form",
        ExpressionAttributeValues: { ":state_form": "CO-2025-4-21E" },
      });
    });
  });

  describe("scanForAllFormIds", () => {
    it("should query answers from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 2,
        Items: [mockAnswer1, mockAnswer2],
      });

      const result = await scanForAllFormIds();

      expect(result).toEqual(["CO-2025-4-21E", "CO-2025-4-GRE"]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-form-answers",
          ProjectionExpression: "state_form",
        })
      );
    });
  });

  describe("updateAnswer", () => {
    it("should update an object in dynamo", async () => {
      const mockAnswer = {
        answer_entry: "CO-2025-4-21E-0518-03",
        rows: [{ col1: "m", col2: "o", col3: "c", col4: "k" }],
        last_modified: "2026-05-15T16:53:37.978Z",
        last_modified_by: "mock username",
      } as FormAnswer;

      await updateAnswer(mockAnswer);

      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: "local-form-answers",
        Key: { answer_entry: "CO-2025-4-21E-0518-03" },
        UpdateExpression:
          "SET #rows = :rows, last_modified = :last_modified, last_modified_by = :last_modified_by",
        ExpressionAttributeNames: { "#rows": "rows" },
        ExpressionAttributeValues: {
          ":rows": [{ col1: "m", col2: "o", col3: "c", col4: "k" }],
          ":last_modified": "2026-05-15T16:53:37.978Z",
          ":last_modified_by": "mock username",
        },
      });
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
      });
    });
  });
});
