import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as obtainAvailableForms } from "./obtainAvailableForms.ts";
import { authorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdminOrUserForState: vi.fn(),
}));

const mockScan = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = { body: JSON.stringify({ stateId: "CO" })};
const mockForm1 = { mockForm: 1 };
const mockForm2 = { mockForm: 2 };
const mockForms = [mockForm1, mockForm2];

describe("obtainAvailableForms.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
    mockScan.mockResolvedValueOnce({
      Count: 2,
      Items: mockForms,
    })

    const response = await obtainAvailableForms(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify(mockForms),
    }));

    expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-state-forms",
      Select: "ALL_ATTRIBUTES",
      ExpressionAttributeValues: { ":stateId": "CO" },
      FilterExpression: "state_id = :stateId",
      ConsistentRead: true,
    }), expect.any(Function));
  });

  it("should return an error if there are no state forms", async () => {
    mockScan.mockResolvedValueOnce({
      Count: 0,
    })

    const response = await obtainAvailableForms(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({
        error: "No state form list found for this state"
      }),
    }));
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdminOrUserForState.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainAvailableForms(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
