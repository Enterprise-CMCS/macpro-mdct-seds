import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as updateCreateFormTemplate } from "./updateCreateFormTemplate.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../../auth/authConditions.ts";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.ts", () => ({
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
    year: 2025,
    template: [mockTemplate],
  }),
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateCreateFormTemplate.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store the provided JSON data in dynamo", async () => {
    const response = await updateCreateFormTemplate(mockEvent, {} as any);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: JSON.stringify({
          status: 200,
          message: "Template updated for 2025!",
        }),
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

    const response = await updateCreateFormTemplate(
      {
        body: JSON.stringify({
          year: 2025,
          template: [42],
        }),
      },
      {} as any
    );

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 400,
        body: JSON.stringify({
          status: 400,
          message: "Invalid JSON. Please review your template.",
        }),
      })
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return an error if the template is undefined", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    const response = await updateCreateFormTemplate(
      {
        body: JSON.stringify({
          year: 2025,
          template: [],
        }),
      },
      {} as any
    );

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 400,
        body: JSON.stringify({
          status: 400,
          message: "Invalid JSON. Please review your template.",
        }),
      })
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return an error if the body is missing data", async () => {
    const mockPut = vi.fn();
    mockDynamo.on(PutCommand).callsFakeOnce(mockPut);

    const response = await updateCreateFormTemplate(
      {
        body: JSON.stringify({}),
      },
      {} as any
    );

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 400,
        body: JSON.stringify({
          status: 422,
          message: "Please specify both a year and a template",
        }),
      })
    );
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateCreateFormTemplate(mockEvent, {} as any);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 500,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
