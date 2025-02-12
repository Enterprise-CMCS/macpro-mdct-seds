import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as obtainUserByEmail } from "./obtainUserByEmail.js";
import {
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions.js";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.js", () => ({
  authorizeAnyUser: vi.fn(),
  authorizeAdminOrUserWithEmail: vi.fn(),
}));

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {
  body: JSON.stringify({ email: "user1@test.com" }),
};

const mockUser = {
  id: 1,
  email: "user1@test.com",
};

describe("obtainUserByEmail.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user data from dynamo", async () => {
    mockScan.mockResolvedValueOnce({ Count: 1, Items: [mockUser] });

    const response = await obtainUserByEmail(mockEvent);

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
      ExpressionAttributeValues: { ":email": "user1@test.com" },
      FilterExpression: "email = :email",
    }), expect.any(Function));
  });

  it("should return Internal Server Error if the user token is invalid", async () => {
    authorizeAnyUser.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainUserByEmail(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });

  it("should return empty results regardless of requesting user", async () => {
    authorizeAdminOrUserWithEmail.mockRejectedValueOnce(new Error("Forbidden"));
    mockScan.mockResolvedValueOnce({ Count: 0 });

    const response = await obtainUserByEmail(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: "false",
    }));

    // Since our mock rejection wasn't exercised, replace it with a no-op
    authorizeAdminOrUserWithEmail.mockReset();
    authorizeAdminOrUserWithEmail.mockResolvedValue();
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    mockScan.mockResolvedValueOnce({ Count: 1, Items: [mockUser] });
    authorizeAdminOrUserWithEmail.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await obtainUserByEmail(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
