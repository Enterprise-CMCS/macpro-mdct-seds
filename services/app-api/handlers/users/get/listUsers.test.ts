import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as listUsers } from "./listUsers.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../../auth/authConditions.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../../libs/response-lib.ts";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

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

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([mockUser1, mockUser2]),
      })
    );
  });

  it("should return an empty array if no users exist", async () => {
    mockScan.mockResolvedValueOnce({ Count: 0 });

    const response = await listUsers(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([]),
      })
    );
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await listUsers(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
