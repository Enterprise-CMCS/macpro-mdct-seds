import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as getUserById } from "./getUserById.ts";
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

const mockEvent = {
  pathParameters: {
    userId: "42",
  },
};
const mockUser = {
  id: 42,
  email: "user@test.com",
};

describe("getUserById.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch the requested user data from dynamo", async () => {
    mockScan.mockResolvedValueOnce({ Count: 1, Items: mockUser });

    const response = await getUserById(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockUser),
      })
    );
  });

  it("should return an error if the user cannot be found", async () => {
    mockScan.mockResolvedValueOnce({ Count: 0 });

    const response = await getUserById(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.NotFound);
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await getUserById(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
