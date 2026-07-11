import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockBatchWrite,
  mockGet,
  mockScan,
  mockUpdate,
} from "../libs/dynamo-mocking.ts";
import {
  getStateForm,
  scanFormsByQuarter,
  scanFormsByQuarterAndStatus,
  scanFormsByState,
  scanFormsByStateAndQuarter,
  scanFormsWithTotals,
  StateForm,
  updateComment,
  updateCommentAndStatus,
  updateEnrollmentCounts,
  writeAllStateForms,
} from "./stateForms.ts";

import { FormStatus } from "../shared/types.ts";

const mockFormCO21E = { state_id: "CO", form: "21E" } as StateForm;
const mockFormCOGRE = { state_id: "CO", form: "GRE" } as StateForm;
const mockFormTX21E = { state_id: "TX", form: "21E" } as StateForm;

describe("State Form storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scanFormsByState", () => {
    it("should fetch forms from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [mockFormCO21E, mockFormCOGRE],
      });

      const result = await scanFormsByState("CO");

      expect(result).toEqual([mockFormCO21E, mockFormCOGRE]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-state-forms",
          FilterExpression: "state_id = :state_id",
          ExpressionAttributeValues: {
            ":state_id": "CO",
          },
        })
      );
    });
  });

  describe("scanFormsByStateAndQuarter", () => {
    it("should fetch forms from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [mockFormCO21E, mockFormCOGRE],
      });

      const result = await scanFormsByStateAndQuarter("CO", 2025, 4);

      expect(result).toEqual([mockFormCO21E, mockFormCOGRE]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-state-forms",
          FilterExpression:
            "state_id = :state_id AND #year = :year AND quarter = :quarter",
          ExpressionAttributeNames: { "#year": "year" },
          ExpressionAttributeValues: {
            ":state_id": "CO",
            ":year": 2025,
            ":quarter": 4,
          },
        })
      );
    });
  });

  describe("scanFormsByQuarter", () => {
    it("should fetch forms from dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Count: 3,
        Items: [mockFormCO21E, mockFormCOGRE, mockFormTX21E],
      });

      const result = await scanFormsByQuarter(2025, 4);

      expect(result).toEqual([mockFormCO21E, mockFormCOGRE, mockFormTX21E]);
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-state-forms",
          FilterExpression: "#year = :year AND quarter = :quarter",
          ExpressionAttributeNames: { "#year": "year" },
          ExpressionAttributeValues: {
            ":year": 2025,
            ":quarter": 4,
          },
        })
      );
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
      expect(mockScan).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-state-forms",
          FilterExpression:
            "#year = :year AND quarter = :quarter AND status_id = :status_id",
          ExpressionAttributeNames: { "#year": "year" },
          ExpressionAttributeValues: {
            ":year": 2025,
            ":quarter": 4,
            ":status_id": FormStatus.InProgress,
          },
        })
      );
    });
  });

  describe("scanFormsWithTotals", () => {
    it("should fetch forms from Dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Items: [mockFormCO21E, mockFormTX21E],
      });

      const result = await scanFormsWithTotals();

      expect(result).toEqual([mockFormCO21E, mockFormTX21E]);
      expect(mockScan).toHaveBeenCalledWith({
        TableName: "local-state-forms",
        FilterExpression: "quarter = :quarter AND form IN (:f1, :f2)",
        ExpressionAttributeValues: {
          ":quarter": 4,
          ":f1": "21E",
          ":f2": "64.21E",
        },
        ConsistentRead: true,
      });
    });
  });

  describe("getStateForm", () => {
    it("should fetch a form from dynamo", async () => {
      mockGet.mockResolvedValueOnce({ Item: mockFormCO21E });

      const result = await getStateForm("CO-2025-4-21E");

      expect(result).toBe(mockFormCO21E);
      expect(mockGet).toHaveBeenCalledWith({
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-4-21E" },
      });
    });
  });

  describe("updateEnrollmentCounts", () => {
    it("should update a form in dynamo", async () => {
      await updateEnrollmentCounts({
        state_form: "CO-2025-4-21E",
        enrollmentCounts: {
          type: "separate",
          year: 2025,
          count: 123,
        },
        last_modified: "2026-05-15T18:23:26.798Z",
        last_modified_by: "mock username",
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-4-21E" },
        UpdateExpression:
          "SET enrollmentCounts = :enrollmentCounts, last_modified = :last_modified, last_modified_by = :last_modified_by",
        ExpressionAttributeValues: {
          ":enrollmentCounts": {
            type: "separate",
            year: 2025,
            count: 123,
          },
          ":last_modified": "2026-05-15T18:23:26.798Z",
          ":last_modified_by": "mock username",
        },
      });
    });
  });

  describe("updateComment", () => {
    it("should update a form in dynamo", async () => {
      await updateComment({
        state_form: "CO-2025-4-21E",
        state_comments: [{ type: "text_multiline", entry: "mock comment" }],
        last_modified: "2026-05-15T18:23:26.798Z",
        last_modified_by: "mock username",
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-4-21E" },
        UpdateExpression:
          "SET state_comments = :state_comments, last_modified = :last_modified, last_modified_by = :last_modified_by",
        ExpressionAttributeValues: {
          ":state_comments": [
            { type: "text_multiline", entry: "mock comment" },
          ],
          ":last_modified": "2026-05-15T18:23:26.798Z",
          ":last_modified_by": "mock username",
        },
      });
    });
  });

  describe("updateCommentAndStatus", () => {
    it("should update a form in dynamo", async () => {
      await updateCommentAndStatus({
        state_form: "CO-2025-4-21E",
        state_comments: [{ type: "text_multiline", entry: "mock comment" }],
        status_id: 2,
        last_modified: "2026-05-15T18:23:26.798Z",
        last_modified_by: "mock username",
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-4-21E" },
        UpdateExpression:
          "SET state_comments = :state_comments, status_id = :status_id, last_modified = :last_modified, last_modified_by = :last_modified_by, status_date = :status_date, status_modified_by = :status_modified_by",
        ExpressionAttributeValues: {
          ":state_comments": [
            { type: "text_multiline", entry: "mock comment" },
          ],
          ":status_id": 2,
          ":last_modified": "2026-05-15T18:23:26.798Z",
          ":last_modified_by": "mock username",
          ":status_date": "2026-05-15T18:23:26.798Z",
          ":status_modified_by": "mock username",
        },
      });
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
      });
    });
  });
});
