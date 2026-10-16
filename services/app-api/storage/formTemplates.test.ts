import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockGet, mockPut } from "../libs/dynamo-mocking.ts";
import { FormTemplate, getTemplate, putTemplate } from "./formTemplates.ts";

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
});
