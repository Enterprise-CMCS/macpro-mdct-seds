import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as listUsers } from "./listUsers.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {} as APIGatewayProxyEvent;

const mockUser1 = {
  id: 1,
  email: "user1@test.com",
};
const mockUser2 = {
  id: 2,
  email: "user2@test.com",
};

describe("listUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch user data from dynamo", async () => {
    handler.setupAdminUser();
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
    handler.setupAdminUser();
    mockScan.mockResolvedValueOnce({ Count: 0 });

    const response = await listUsers(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify([]),
      })
    );
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("CO");

    const response = await listUsers(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
