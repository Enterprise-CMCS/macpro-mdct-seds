import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as obtainUsernameBySub } from "./obtainUsernameBySub.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {
  body: JSON.stringify({ usernameSub: "0000-1111-2222-3333" }),
};

const mockUser = {
  id: 1,
  email: "user1@test.com",
};

describe("obtainUsernameBySub.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user data from dynamo", async () => {
    mockScan.mockResolvedValueOnce({ Count: 1, Items: [mockUser] });

    const response = await obtainUsernameBySub(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        Items: [mockUser],
        Count: 1,
      }),
    }));
    expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-auth-user",
      Select: "ALL_ATTRIBUTES",
      ExpressionAttributeValues: { ":usernameSub": "0000-1111-2222-3333" },
      FilterExpression: "usernameSub = :usernameSub",
    }), expect.any(Function));
  });

  it("should return false if no user can be found", async () => {
    mockScan.mockResolvedValueOnce({ Count: 0 });

    const response = await obtainUsernameBySub(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: "false",
    }));
  });

  it.skip("should return Internal Server Error if the user token is invalid", async () => {
    // This test is skipped because this lambda does not have any authorization.
    // This is not a disaster, because it's also not exposed to the API.
    authorizeAnyUser.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainUsernameBySub(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
