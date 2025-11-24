import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTemplate, putTemplate } from "./formTemplates.js";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);
const mockPut = vi.fn();
mockDynamo.on(PutCommand).callsFake(mockPut);

const mockTemplate = { year: 2025, template: [{ question: "Q1" }] };

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
      expect(mockGet).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-templates",
        Key: { year: 2025 }
      }), expect.any(Function));
    });
  });

  describe("putTemplate", () => {
    it("should put the given item into dynamo", async () => {
      await putTemplate(mockTemplate);

      expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
        TableName: "local-form-templates",
        Item: mockTemplate
      }), expect.any(Function));
    });
  });
});
