import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as updateTemplate } from "./updateTemplate.ts";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

const mockPut = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(PutCommand).callsFake(mockPut);

const mockTemplate = {
  mockTemplateProp: "mockTemplateValue",
};

const mockEvent = {
  body: JSON.stringify({ template: [mockTemplate] }),
  pathParameters: {
    year: "2025",
  } as Record<string, string>,
} as APIGatewayProxyEvent;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store the provided JSON data in dynamo", async () => {
    handler.setupAdminUser();
    const response = await updateTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: '"Template updated for 2025!"',
      })
    );

    expect(mockPut).toHaveBeenCalledWith(
      {
        TableName: "local-form-templates",
        Item: {
          year: 2025,
          template: [mockTemplate],
          lastSynced: expect.stringMatching(ISO_DATE_REGEX),
        },
      },
      expect.any(Function)
    );
  });

  it("should return an error if the body is missing data", async () => {
    handler.setupAdminUser();
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    const response = await updateTemplate({
      body: JSON.stringify(null),
      pathParameters: { year: "2025" } as Record<string, string>,
    } as APIGatewayProxyEvent);

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return an error for invalid parameters", async () => {
    handler.setupAdminUser();

    const response = await updateTemplate({
      ...mockEvent,
      pathParameters: { year: "zzz" },
    });

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("CO");

    const response = await updateTemplate(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
