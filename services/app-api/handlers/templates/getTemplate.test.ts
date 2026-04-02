import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as getTemplate } from "./getTemplate.ts";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);

const mockEvent = {
  pathParameters: {
    year: "2025",
  } as Record<string, string>,
} as APIGatewayProxyEvent;

const mockFormTemplate = {
  mockProp: "mockValue",
};

describe("getTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for the appropriate data", async () => {
    handler.setupAdminUser();
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

  it("should return an error for invalid parameters", async () => {
    handler.setupAdminUser();

    const response = await getTemplate({
      ...mockEvent,
      pathParameters: { year: "zzz" },
    });

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return Not Found if there are no results", async () => {
    handler.setupAdminUser();
    mockGet.mockResolvedValueOnce({});

    const response = await getTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.NotFound,
        body: '"Could not find form template for year: 2025"',
      })
    );
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupBusinessUser();

    const response = await getTemplate(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
