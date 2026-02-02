import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as obtainFormTemplate } from "./obtainFormTemplate.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../../auth/authConditions.ts";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../../libs/response-lib.ts";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockEvent = {
  pathParameters: {
    year: "2025",
  },
};

const mockFormTemplate = {
  mockProp: "mockValue",
};

describe("obtainFormTemplate.ts", () => {
  beforeEach(() => {
    mockDynamo.reset();
  });

  it("should query dynamo for the appropriate data", async () => {
    const mockQuery = vi.fn().mockResolvedValueOnce({
      Count: 1,
      Items: [mockFormTemplate],
    });
    mockDynamo.on(QueryCommand).callsFakeOnce(mockQuery);

    const response = await obtainFormTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: JSON.stringify([mockFormTemplate]),
      })
    );
    expect(mockQuery).toHaveBeenCalledWith(
      {
        TableName: "local-form-templates",
        ExpressionAttributeNames: { "#theYear": "year" },
        ExpressionAttributeValues: { ":year": 2025 },
        KeyConditionExpression: "#theYear = :year",
      },
      expect.any(Function)
    );
  });

  it("should return Not Found if there are no results", async () => {
    const mockQuery = vi.fn().mockResolvedValueOnce({ Count: 0 });
    mockDynamo.on(QueryCommand).callsFakeOnce(mockQuery);

    const response = await obtainFormTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.NotFound,
        body: JSON.stringify({
          status: StatusCodes.NotFound,
          message: "Could not find form template for year: 2025",
        }),
      })
    );
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainFormTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
