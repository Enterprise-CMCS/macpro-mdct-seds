import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as listFormsForQuarter } from "./listFormsForQuarter.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

const mockScan = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {
  pathParameters: {
    state: "CO",
    year: "2025",
    quarter: "1",
  } as Record<string, string>,
} as APIGatewayProxyEvent;
const mockScanResponse = {
  Items: [{ mockForm: 1 }, { mockForm: 2 }],
  Count: 2,
};

describe("listFormsForQuarter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
    handler.setupStateUser("CO");
    mockScan.mockResolvedValueOnce(mockScanResponse);

    const response = await listFormsForQuarter(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([{ mockForm: 1 }, { mockForm: 2 }]),
      })
    );

    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-state-forms",
        FilterExpression:
          "state_id = :state and quarter = :quarter and #year = :year",
        ExpressionAttributeNames: { "#year": "year" },
        ExpressionAttributeValues: {
          ":state": "CO",
          ":year": 2025,
          ":quarter": 1,
        },
      }),
      expect.any(Function)
    );
  });

  it.each([
    {
      reason: "bad state",
      params: { state: "zzz", year: "2026", quarter: "1" },
    },
    {
      reason: "bad year",
      params: { state: "CO", year: "zzz", quarter: "1" },
    },
    {
      reason: "bad quarter",
      params: { state: "CO", year: "2026", quarter: "zzz" },
    },
  ])(
    "should return an error for bad parameters ($reason)",
    async ({ params }) => {
      handler.setupAdminUser();
      const response = await listFormsForQuarter({
        ...mockEvent,
        pathParameters: params,
      });
      expect(response.statusCode).toBe(StatusCodes.BadRequest);
    }
  );

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("TX");

    const response = await listFormsForQuarter(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
