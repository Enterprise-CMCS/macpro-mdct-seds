import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockScan, mockGet, mockPut } from "../libs/dynamo-mocking.ts";
import {
  FormTemplate,
  getTemplate,
  putTemplate,
  scanTemplateYears,
} from "./formTemplates.ts";

const mockTemplate = {
  year: 2025,
  template: [{ question: "Q1" }],
} as FormTemplate;

describe("Form Template storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTemplate", () => {
    it("should get the template for the given year from dynamo", async () => {
      mockGet.mockResolvedValueOnce({
        Item: mockTemplate,
      });

      const result = await getTemplate(2025);

      expect(result).toEqual(mockTemplate);
      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-form-templates",
          Key: { year: 2025 },
        })
      );
    });
  });

  describe("putTemplate", () => {
    it("should put the given item into dynamo", async () => {
      await putTemplate(mockTemplate);

      expect(mockPut).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: "local-form-templates",
          Item: mockTemplate,
        })
      );
    });
  });

  describe("scanTemplateYears", () => {
    it("should fetch template years from Dynamo", async () => {
      mockScan.mockResolvedValueOnce({
        Items: [{ year: 2023 }, { year: 2025 }, { year: 2024 }],
      });

      const result = await scanTemplateYears();

      expect(result).toEqual([2023, 2025, 2024]);
      expect(mockScan).toHaveBeenCalledWith({
        TableName: "local-form-templates",
        ProjectionExpression: "#year",
        ExpressionAttributeNames: { "#year": "year" },
      });
    });
  });
});
