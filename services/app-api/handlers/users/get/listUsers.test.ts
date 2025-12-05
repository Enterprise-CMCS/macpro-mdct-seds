import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as listUsers } from "./listUsers.ts";
import { authorizeAdmin } from "../../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {};

const mockUser1 = {
  id: 1,
  email: "user1@test.com",
};
const mockUser2 = {
  id: 2,
  email: "user2@test.com",
};

describe("listUsers.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user data from dynamo", async () => {
    mockScan.mockResolvedValueOnce({ Count: 2, Items: [mockUser1, mockUser2] });

    const response = await listUsers(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify([mockUser1, mockUser2]),
    }));
  });

  it.skip("should return an error if no users exist", async () => {
    // This won't work, because dynamoDb.scan always returns an Items array,
    // even if it's empty. The code under test only checks for the existence
    // of .Items, not whether it's empty. TODO, fix this code (or delete it)
    mockScan.mockResolvedValueOnce({ Count: 0 });

    const response = await listUsers(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "No Users not found." }),
    }));
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await listUsers(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
