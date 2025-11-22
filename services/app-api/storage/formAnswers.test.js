import { beforeEach, describe, expect, it, vi } from "vitest";
import { scanForAllFormIds } from "./formAnswers.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockAnswer1 = { state_form: "CO-2025-4-21E" };
const mockAnswer2 = { state_form: "CO-2025-4-GRE" };

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
});
