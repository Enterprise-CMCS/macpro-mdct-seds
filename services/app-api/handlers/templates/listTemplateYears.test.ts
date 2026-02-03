import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as listTemplateYears } from "./listTemplateYears.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../auth/authConditions.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";

vi.mock("../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockEvent = {};

describe("listTemplateYears", () => {
  beforeEach(() => {
    mockDynamo.reset();
  });

  it("should query dynamo for the appropriate data", async () => {
    const mockScan = vi.fn().mockResolvedValueOnce({
      Count: 1,
      Items: [{ year: 2024 }, { year: 2023 }, { year: 2025 }],
    });
    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan);

    const response = await listTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([2024, 2023, 2025]),
      })
    );
    expect(mockScan).toHaveBeenCalledWith(
      {
        TableName: "local-form-templates",
        ExpressionAttributeNames: { "#year": "year" },
        ProjectionExpression: "#year",
      },
      expect.any(Function)
    );
  });

  it("should return Not Found if there are no results", async () => {
    const mockScan = vi.fn().mockResolvedValueOnce({ Count: 0 });
    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan);

    const response = await listTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([]),
      })
    );
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await listTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
