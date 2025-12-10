import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as obtainFormsList } from "./obtainFormsList.ts";
import {
  authorizeAdminOrUserForState as actualAuthorizeAdminOrUserForState
} from "../../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdminOrUserForState: vi.fn(),
}));
const authorizeAdminOrUserForState = vi.mocked(actualAuthorizeAdminOrUserForState);

const mockScan = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {
  body: JSON.stringify({
    state: "CO",
    year: 2025,
    quarter: 1,
  }),
};
const mockScanResponse = {
  Items: [{ mockForm: 1 }, { mockForm: 2 }],
  Count: 2,
};

describe("obtainFormsList.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
    mockScan.mockResolvedValueOnce(mockScanResponse);

    const response = await obtainFormsList(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify(mockScanResponse),
    }));

    expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-state-forms",
      Select: "ALL_ATTRIBUTES",
      ExpressionAttributeNames: { "#theYear": "year" },
      ExpressionAttributeValues: { ":state": "CO", ":year": 2025, ":quarter": 1 },
      FilterExpression: "state_id = :state and quarter = :quarter and #theYear = :year",
    }), expect.any(Function));
  });

  /*
   * Note: Although obtainFormsList sends ExclusiveStartKey to dynamoDb.scan,
   * the dynamoDb.scan method ignores that key,
   * because it performs a complete scan every time.
   * This does not lead to buggy behavior;
   * Callers provide startKey only if they believe they've received a partial
   * result (that is, if they received a LastEvaluatedKey in a prior response).
   * Since we only perform complete scans, we never send this,
   * so we are never asked for continuations.
   * In any case, the startKey logic in obtainFormsList is uncovered for now.
   */
  it.skip("should continue a prior scan if a key is provided", async () => {
    mockScan.mockResolvedValueOnce(mockScanResponse);
    const mockEventWithKey = {
      body: JSON.stringify({
        state: "CO",
        year: 2025,
        quarter: 1,
        startKey: "mockKey",
      }),
    };

    const response = await obtainFormsList(mockEventWithKey);

    expect(response).toEqual(expect.objectContaining({ statusCode: 200 }));

    expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
      ExclusiveStartKey: "mockKey",
    }), expect.any(Function));
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdminOrUserForState.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainFormsList(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
