import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as createUser } from "./createUser.js";
import { obtainUserByUsername } from "./obtainUserByUsername.js";
import { getUserDetailsFromEvent } from "../../../libs/authorization.js";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../libs/authorization.js", () => ({
  getUserDetailsFromEvent: vi.fn(),
}));

vi.mock("./obtainUserByUsername.js", () => ({
  obtainUserByUsername: vi.fn(),
}));

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockPut = vi.fn();
mockDynamo.on(PutCommand).callsFake(mockPut);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {};

const mockUser = {
  email: "stateuserCO@test.com",
  firstName: "Cheryl",
  lastName: "O'Lorry'",
  role: "state",
  username: "COLO",
  usernameSub: "0000-1111-2222-3333",
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("createUser.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should read user data from the event headers and store it in dynamo", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce(mockUser);
    mockScan.mockResolvedValueOnce({ Count: 0, Items: [] });

    const response = await createUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: `"User COLO Added!"`,
    }));

    expect(mockPut).toHaveBeenCalledWith({
      TableName: "local-auth-user",
      Item: {
        ...mockUser,
        dateJoined: expect.stringMatching(ISO_DATE_REGEX),
        lastLogin: expect.stringMatching(ISO_DATE_REGEX),
        lastSynced: expect.stringMatching(ISO_DATE_REGEX),
        isSuperUser: "true",
        states: [],
        userId: "0",
      },
    }, expect.any(Function));
  });

  it("should assign the new user the next sequential ID", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce(mockUser);
    mockScan.mockResolvedValueOnce({
      Count: 3,
      Items: [
        { userId: "10" },
        { userId: "30" },
        { userId: "20" },
      ]
    });

    const response = await createUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: `"User COLO Added!"`,
    }));

    expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-auth-user",
      Item: expect.objectContaining({
        userId: "31",
      })
    }), expect.any(Function));
  });

  it("should fail if the user has somehow created a Cognito account with no username", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce({ username: undefined });

    const response = await createUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: `"Please enter a username"`,
    }));

    expect(mockPut).not.toHaveBeenCalled();
  });

  it("should do nothing if the user already exists", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce(mockUser);
    obtainUserByUsername.mockResolvedValueOnce(mockUser);
    mockScan.mockResolvedValueOnce({ Count: 0, Items: [] });

    const response = await createUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: `"User COLO already exists"`,
    }));

    expect(mockPut).not.toHaveBeenCalled();
  });
});
