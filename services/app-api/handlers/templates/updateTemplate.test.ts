import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as updateTemplate } from "./updateTemplate.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../auth/authConditions.ts";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";

vi.mock("../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

const mockPut = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(PutCommand).callsFake(mockPut);

const mockTemplate = {
  mockTemplateProp: "mockTemplateValue",
};

const mockEvent = {
  body: JSON.stringify({
    template: [mockTemplate],
  }),
  pathParameters: {
    year: "2025",
  },
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store the provided JSON data in dynamo", async () => {
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

  it("should return an error if the template is not an object", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    const response = await updateTemplate({
      body: JSON.stringify({
        template: [42],
      }),
      pathParameters: { year: "2025" },
    });

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.BadRequest,
        body: '"Invalid JSON. Please review your template."',
      })
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return an error if the template is undefined", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    const response = await updateTemplate({
      body: JSON.stringify({
        template: [],
      }),
      pathParameters: { year: "2025" },
    });

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.BadRequest,
        body: '"Invalid JSON. Please review your template."',
      })
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return an error if the body is missing data", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    const response = await updateTemplate({
      body: JSON.stringify({}),
      pathParameters: { year: "2025" },
    });

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.BadRequest,
        body: '"Please specify both a year and a template."',
      })
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateTemplate(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
