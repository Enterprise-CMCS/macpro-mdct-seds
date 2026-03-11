import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as listFormsForState } from "./listFormsForState.ts";
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
  } as Record<string, string>,
} as APIGatewayProxyEvent;
const mockForm1 = { mockForm: 1 };
const mockForm2 = { mockForm: 2 };
const mockForms = [mockForm1, mockForm2];

describe("listFormsForState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
    handler.setupBusinessUser();
    mockScan.mockResolvedValueOnce({
      Count: 2,
      Items: mockForms,
    });

    const response = await listFormsForState(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockForms),
      })
    );

    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-state-forms",
        FilterExpression: "state_id = :stateId",
        ExpressionAttributeValues: { ":stateId": "CO" },
        ConsistentRead: true,
      }),
      expect.any(Function)
    );
  });

  it("should throw an error if there are no state forms", async () => {
    handler.setupStateUser("CO");
    mockScan.mockResolvedValueOnce({
      Count: 0,
    });

    await expect(listFormsForState(mockEvent)).rejects.toThrow(/No state form/);
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("TX");

    const response = await listFormsForState(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
