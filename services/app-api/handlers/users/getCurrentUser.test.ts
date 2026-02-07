import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as getCurrentUser } from "./getCurrentUser.ts";
import { createUser } from "./createUser.ts";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { jwtDecode } from "jwt-decode";
import { CmsAmplifyToken } from "../../libs/authorization.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);
const mockUpdate = vi.fn();
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

vi.mock("./createUser.ts", () => ({
  createUser: vi.fn(),
}));

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

const cognitoTokenWithSub: CmsAmplifyToken = {
  sub: "mock-sub",
  identities: [{ userId: "EUA0" }],
  "custom:ismemberof": "CHIP_D_USER_GROUP",
  given_name: "mockGiven",
  family_name: "mockFamily",
  email: "mockEmail@example.com",
};

const encodeJwt = (x: any) => `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify(x))}.`;
const mockEvent = {
  path: "/getCurrentUser",
  headers: {
    "x-api-key": encodeJwt(cognitoTokenWithSub),
  } as Record<string, string | null>,
} as APIGatewayProxyEvent;

const mockUser = {
  userId: "42",
  sub: "mock-sub",
};

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch the requested user data from dynamo, updating lastLogin", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockUser] });

    const response = await getCurrentUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockUser),
      })
    );

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
      ...mockEvent,
      headers: {
        "x-api-key": encodeJwt({ "custom:ismemberof": "CHIP_D_USER_GROUP" }),
      },
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
