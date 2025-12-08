import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as updateStateForms } from "./updateStateForms.ts";
import {
  authorizeUserForState as actualAuthorizeUserForState
} from "../../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeUserForState: vi.fn(),
}));
const authorizeUserForState = vi.mocked(actualAuthorizeUserForState);

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockPut = vi.fn();
mockDynamo.on(PutCommand).callsFake(mockPut);
const mockQuery = vi.fn();
mockDynamo.on(QueryCommand).callsFake(mockQuery);

const mockEventBody = {
  state: "CO",
  year: 2025,
  quarter: 1,
  form: "21E",
  totalEnrollment: 42,
};
const mockEvent = { body: JSON.stringify(mockEventBody) };

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateStateForms.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add an enrollmentCounts property to existing state forms", async () => {
    mockQuery.mockResolvedValueOnce({
      Count: 1,
      Items: [
        {
          form: "21E",
          foo: "bar",
        },
      ],
    });

    const response = await updateStateForms(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        status: 200,
        message: "Enrollment Data successfully updated",
      }),
    }));

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "local-state-forms",
      Select: "ALL_ATTRIBUTES",
      ExpressionAttributeValues: { ":state_form": "CO-2025-1-21E" },
      KeyConditionExpression: "state_form = :state_form",
      ConsistentRead: true,
    }, expect.any(Function));

    expect(mockPut).toHaveBeenCalledWith({
      TableName: "local-state-forms",
      Item: {
        form: "21E",
        foo: "bar",
        enrollmentCounts: {
          type: "separate",
          year: 2025,
          count: 42,
        },
        lastSynced: expect.stringMatching(ISO_DATE_REGEX),
      }
    }, expect.any(Function));
  });

  it("should use the appropriate enrollmentCounts type for the specified form", async () => {
    mockQuery.mockResolvedValueOnce({
      Count: 1,
      Items: [
        {
          form: "64.21E",
          enrollmentCounts: { foo: "bar" }, // <- this will be overwritten
        },
      ],
    });

    const response = await updateStateForms({
      body: JSON.stringify({...mockEventBody, form: "64.21E" }),
    });

    expect(response.statusCode).toBe(200);

    expect(mockQuery).toHaveBeenCalledWith(expect.objectContaining({
      ExpressionAttributeValues: { ":state_form": "CO-2025-1-64.21E" },
    }), expect.any(Function));

    expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
      Item: expect.objectContaining({
        enrollmentCounts: {
          type: "expansion", // <- not "separate", because this is 64.21E
          year: 2025,
          count: 42,
        },
      }),
    }), expect.any(Function));
  });

  it("should merely sync non-enrollment form types", async () => {
    mockQuery.mockResolvedValueOnce({
      Count: 1,
      Items: [
        {
          form: "GRE",
        },
      ],
    });

    const response = await updateStateForms({
      body: JSON.stringify({...mockEventBody, form: "GRE" }),
    });

    expect(response.statusCode).toBe(200);
    expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
      Item: {
        form: "GRE",
        lastSynced: expect.stringMatching(ISO_DATE_REGEX),
        // No enrollmentCounts property was added
      },
    }), expect.any(Function));
  });

  it("should do nothing if the requested form does not exist", async () => {
    mockQuery.mockResolvedValueOnce({ Count: 0 });

    const response = await updateStateForms(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify([]),
    }));

    expect(response.statusCode).toBe(200);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeUserForState.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateStateForms(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
