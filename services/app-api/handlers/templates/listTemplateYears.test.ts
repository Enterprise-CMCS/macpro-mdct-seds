import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as listTemplateYears } from "./listTemplateYears.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);

const mockEvent = {} as APIGatewayProxyEvent;

describe("listTemplateYears", () => {
  beforeEach(() => {
    mockDynamo.reset();
  });

  it("should query dynamo for the appropriate data", async () => {
    handler.setupAdminUser();
    const mockScan = vi.fn().mockResolvedValueOnce({
      Count: 1,
      Items: [{ year: 2024 }, { year: 2023 }, { year: 2025 }],
    });
    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan);

    const response = await listTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([2024, 2023, 2025]),
      })
    );
    expect(mockScan).toHaveBeenCalledWith(
      {
        TableName: "local-form-templates",
        ExpressionAttributeNames: { "#year": "year" },
        ProjectionExpression: "#year",
      },
      expect.any(Function)
    );
  });

  it("should return Not Found if there are no results", async () => {
    handler.setupAdminUser();
    const mockScan = vi.fn().mockResolvedValueOnce({ Count: 0 });
    mockDynamo.on(ScanCommand).callsFakeOnce(mockScan);

    const response = await listTemplateYears(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([]),
      })
    );
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("CO");

    const response = await listTemplateYears(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
