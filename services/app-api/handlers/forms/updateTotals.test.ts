import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as updateTotals } from "./updateTotals.ts";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockUpdate = vi.fn();
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);

const mockParams: Record<string, string> = {
  state: "CO",
  year: "2025",
  quarter: "1",
  form: "21E",
} as Record<string, string>;

const mockEvent = {
  body: JSON.stringify({
    state: "CO",
    year: 2025,
    quarter: 1,
    form: "21E",
    totalEnrollment: 42,
  }),
  pathParameters: mockParams,
} as APIGatewayProxyEvent;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateTotals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add an enrollmentCounts property to existing state forms", async () => {
    handler.setupStateUser("CO");
    mockGet.mockResolvedValueOnce({
      Item: {
        form: "21E",
        foo: "bar",
      },
    });

    const response = await updateTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockGet).toHaveBeenCalledWith(
      {
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-1-21E" },
        ConsistentRead: true,
      },
      expect.any(Function)
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      {
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-1-21E" },
        UpdateExpression:
          "SET last_modified = :last_modified, last_modified_by = :last_modified_by, enrollmentCounts = :enrollmentCounts",
        ExpressionAttributeValues: {
          ":last_modified": expect.stringMatching(ISO_DATE_REGEX),
          ":last_modified_by": "TEST",
          ":enrollmentCounts": {
            year: 2025,
            type: "separate",
            count: 42,
          },
        },
      },
      expect.any(Function)
    );
  });

  it("should use the appropriate enrollmentCounts type for the specified form", async () => {
    handler.setupStateUser("CO");
    mockGet.mockResolvedValueOnce({
      Item: {
        form: "64.21E",
        enrollmentCounts: { foo: "bar" }, // <- this will be overwritten
      },
    });

    const response = await updateTotals({
      ...mockEvent,
      pathParameters: { ...mockParams, form: "64.21E" },
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockGet).toHaveBeenCalledWith(
      expect.objectContaining({
        Key: { state_form: "CO-2025-1-64.21E" },
      }),
      expect.any(Function)
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        ExpressionAttributeValues: expect.objectContaining({
          ":enrollmentCounts": expect.objectContaining({
            type: "expansion",
          }),
        }),
      }),
      expect.any(Function)
    );
  });

  it("should not update forms which do not have enrollment totals", async () => {
    handler.setupStateUser("CO");

    const response = await updateTotals({
      ...mockEvent,
      pathParameters: { ...mockParams, form: "GRE" },
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.each([
    { reason: "no body", body: null },
    { reason: "no enrollment", body: {} },
    { reason: "invalid enrollment", body: { totalEnrollment: "zzz" } },
  ])(
    "should return an error if the body is invalid ($reason)",
    async ({ body }) => {
      handler.setupStateUser("CO");

      const response = await updateTotals({
        ...mockEvent,
        body: JSON.stringify(body),
      });

      expect(response.statusCode).toBe(StatusCodes.BadRequest);
    }
  );

  it("should return an error if the requested form does not exist", async () => {
    handler.setupStateUser("CO");
    mockGet.mockResolvedValueOnce({ Item: undefined });

    const response = await updateTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.NotFound);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupBusinessUser();

    const response = await updateTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
