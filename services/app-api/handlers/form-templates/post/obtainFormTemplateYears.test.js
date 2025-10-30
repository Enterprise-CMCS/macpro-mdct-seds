import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as obtainFormTemplateYears } from "./obtainFormTemplateYears.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.js", () => ({
  authorizeAdmin: vi.fn(),
}));

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockEvent = {};

describe("obtainFormTemplateYears.js", () => {
  beforeEach(() => {
    mockDynamo.reset();
  });

  it("should query dynamo for the appropriate data", async () => {
    const mockScan = vi.fn().mockResolvedValueOnce({
      Count: 1,
      Items: [{ year: 2024 }, { year: 2023 }, { year: 2025 }],
    });
    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan);

    const response = await obtainFormTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        // Note the sort order: most recent year first
        body: JSON.stringify([2025, 2024, 2023]),
      })
    );
    expect(mockScan).toHaveBeenCalledWith(
      {
        TableName: "local-form-templates",
        ExpressionAttributeNames: { "#theYear": "year" },
        ProjectionExpression: "#theYear",
      },
      expect.any(Function)
    );
  });

  it("should return Not Found if there are no results", async () => {
    const mockScan = vi.fn().mockResolvedValueOnce({ Count: 0 });
    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan);

    const response = await obtainFormTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: JSON.stringify([]),
      })
    );
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainFormTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 500,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
