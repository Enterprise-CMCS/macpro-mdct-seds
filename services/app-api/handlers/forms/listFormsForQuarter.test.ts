import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as listFormsForQuarter } from "./listFormsForQuarter.ts";
import { authorizeAdminOrUserForState as actualAuthorizeAdminOrUserForState } from "../../auth/authConditions.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";

vi.mock("../../auth/authConditions.ts", () => ({
  authorizeAdminOrUserForState: vi.fn(),
}));
const authorizeAdminOrUserForState = vi.mocked(
  actualAuthorizeAdminOrUserForState
);

const mockScan = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {
  pathParameters: {
    state: "CO",
    year: "2025",
    quarter: "1",
  },
};
const mockScanResponse = {
  Items: [{ mockForm: 1 }, { mockForm: 2 }],
  Count: 2,
};

describe("listFormsForQuarter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
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
        Select: "ALL_ATTRIBUTES",
        ExpressionAttributeNames: { "#theYear": "year" },
        ExpressionAttributeValues: {
          ":state": "CO",
          ":year": 2025,
          ":quarter": 1,
        },
        FilterExpression:
          "state_id = :state and quarter = :quarter and #theYear = :year",
      }),
      expect.any(Function)
    );
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdminOrUserForState.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await listFormsForQuarter(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
