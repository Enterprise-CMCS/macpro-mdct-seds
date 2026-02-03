import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as getTemplate } from "./getTemplate.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../auth/authConditions.ts";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";

vi.mock("../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);

const mockEvent = {
  pathParameters: {
    year: "2025",
  },
};

const mockFormTemplate = {
  mockProp: "mockValue",
};

describe("getTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for the appropriate data", async () => {
    mockGet.mockResolvedValueOnce({ Item: mockFormTemplate });

    const response = await getTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockFormTemplate),
      })
    );
    expect(mockGet).toHaveBeenCalledWith(
      {
        TableName: "local-form-templates",
        Key: { year: 2025 },
      },
      expect.any(Function)
    );
  });

  it("should return Not Found if there are no results", async () => {
    mockGet.mockResolvedValueOnce({});

    const response = await getTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.NotFound,
        body: '"Could not find form template for year: 2025"',
      })
    );
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await getTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
