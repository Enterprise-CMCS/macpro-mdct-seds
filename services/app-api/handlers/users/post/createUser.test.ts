import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as createUser } from "./createUser.ts";
import { getUserDetailsFromEvent as actualGetUserDetails } from "../../../libs/authorization.ts";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import {
  scanForUserByUsername as actualScanForUser,
  putUser as actualPutUser,
  AuthUser,
} from "../../../storage/users.ts";
import { StatusCodes } from "../../../libs/response-lib.ts";

vi.mock("../../../libs/authorization.ts", () => ({
  getUserDetailsFromEvent: vi.fn(),
}));
const getUserDetailsFromEvent = vi.mocked(actualGetUserDetails);

vi.mock("../../../storage/users.ts", () => ({
  scanForUserByUsername: vi.fn(),
  putUser: vi.fn(),
}));
const scanForUserByUsername = vi.mocked(actualScanForUser);
const putUser = vi.mocked(actualPutUser);

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockPut = vi.fn();
mockDynamo.on(PutCommand).callsFake(mockPut);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {};

const mockUser = {
  userId: "42",
  email: "stateuserCO@test.com",
  firstName: "Cheryl",
  lastName: "O'Lorry'",
  role: "state" as const,
  username: "COLO",
  usernameSub: "0000-1111-2222-3333",
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("createUser.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should read user data from the event headers and store it in dynamo", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce(mockUser);
    mockScan.mockResolvedValueOnce({ Count: 0, Items: [] });

    const response = await createUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: `"User COLO Added!"`,
      })
    );

    expect(mockPut).toHaveBeenCalledWith(
      {
        TableName: "local-auth-user",
        Item: {
          ...mockUser,
          dateJoined: expect.stringMatching(ISO_DATE_REGEX),
          lastLogin: expect.stringMatching(ISO_DATE_REGEX),
          lastSynced: expect.stringMatching(ISO_DATE_REGEX),
          userId: "0",
        },
      },
      expect.any(Function)
    );
  });

  it("should assign the new user the next sequential ID", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce(mockUser);
    mockScan.mockResolvedValueOnce({
      Count: 3,
      Items: [{ userId: "10" }, { userId: "30" }, { userId: "20" }],
    });

    const response = await createUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: `"User COLO Added!"`,
      })
    );

    expect(mockPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-auth-user",
        Item: expect.objectContaining({
          userId: "31",
        }),
      }),
      expect.any(Function)
    );
  });

  it("should fail if the user has somehow created a Cognito account with no username", async () => {
    const invalidUser = { username: undefined } as any;
    getUserDetailsFromEvent.mockResolvedValueOnce(invalidUser);

    const response = await createUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: `"Please enter a username"`,
      })
    );

    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should do nothing if the user already exists", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce(mockUser);
    scanForUserByUsername.mockResolvedValueOnce(mockUser as AuthUser);
    mockScan.mockResolvedValueOnce({ Count: 0, Items: [] });

    const response = await createUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: `"User COLO already exists"`,
      })
    );

    expect(mockPut).not.toHaveBeenCalled();
  });
});
