import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as getCurrentUser } from "./getCurrentUser.ts";
import { createUser } from "../post/createUser.ts";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../../libs/response-lib.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);
const mockUpdate = vi.fn();
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

vi.mock("../post/createUser.ts", () => ({
  createUser: vi.fn(),
}));

const JWT_WITH_MOCK_SUB =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXN1YiIsImlkZW50aXRpZXMiOlt7InVzZXJJZCI6IkVVQTAifV0sImN1c3RvbTppc21lbWJlcm9mIjoiQ0hJUF9EX1VTRVJfR1JPVVAiLCJnaXZlbl9uYW1lIjoibW9ja0dpdmVuIiwiZmFtaWx5X25hbWUiOiJtb2NrRmFtaWx5IiwiZW1haWwiOiJtb2NrRW1haWxAZXhhbXBsZS5jb20ifQ.q2EEbK5DtitfR5-B6gX39h2MsSnJvCiNdTSR2yIcg5Y"; // pragma: allowlist secret
const JWT_WITH_NO_SUB =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGl0aWVzIjpbeyJ1c2VySWQiOiJFVUEwIn1dLCJjdXN0b206aXNtZW1iZXJvZiI6IkNISVBfRF9VU0VSX0dST1VQIn0.31FVSzo6xSqvA5-WSpjFgnk3mgEq9_0WWQX_STuJ7CA"; // pragma: allowlist secret
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
const mockEvent = {
  headers: {
    "x-api-key": JWT_WITH_MOCK_SUB,
  },
};

const mockUser = {
  userId: "42",
  sub: "mock-sub",
};

describe("getUserById.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch the requested user data from dynamo, updating lastLogin", async () => {
    mockScan.mockResolvedValueOnce({ Count: 1, Items: [mockUser] });

    const response = await getCurrentUser(mockEvent);

    expect(createUser).not.toHaveBeenCalled();
    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-auth-user",
        FilterExpression: "usernameSub = :usernameSub",
        ExpressionAttributeValues: { ":usernameSub": "mock-sub" },
      }),
      expect.any(Function)
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-auth-user",
        Key: { userId: "42" },
        UpdateExpression:
          "SET firstName = :firstName, lastName = :lastName, email = :email, lastLogin = :lastLogin",
        ExpressionAttributeValues: {
          ":firstName": "mockGiven",
          ":lastName": "mockFamily",
          ":email": "mockEmail@example.com",
          ":lastLogin": expect.stringMatching(ISO_DATE_REGEX),
        },
      }),
      expect.any(Function)
    );

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockUser),
      })
    );
  });

  it("should return an error if sub is missing from token", async () => {
    const response = await getCurrentUser({
      headers: { "x-api-key": JWT_WITH_NO_SUB },
    });

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: expect.stringContaining("token must contain"),
      })
    );
  });

  it("should create the user if they are not in our database", async () => {
    mockScan
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Count: 1, Items: [mockUser] });

    const response = await getCurrentUser(mockEvent);

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        // This mock data comes from the JWT
        username: "EUA0",
        firstName: "mockGiven",
        lastName: "mockFamily",
        email: "mockEmail@example.com",
        role: "state",
        usernameSub: "mock-sub",
      })
    );

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockUser),
      })
    );
  });

  it("should return an error if the user cannot be created", async () => {
    mockScan.mockResolvedValueOnce({}).mockResolvedValueOnce({});

    const response = await getCurrentUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: expect.stringContaining("Failed to create"),
      })
    );
  });
});
