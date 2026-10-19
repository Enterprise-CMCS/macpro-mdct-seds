import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUser } from "./createUser.ts";
import {
  AuthUser,
  putUser as actualPutUser,
  scanAllUsers as actualScanAllUsers,
  scanForUserByUsername as actualScanForUser,
} from "../../storage/users.ts";

vi.mock("../../storage/users.ts", () => ({
  putUser: vi.fn(),
  scanAllUsers: vi.fn(),
  scanForUserByUsername: vi.fn(),
}));
const putUser = vi.mocked(actualPutUser);
const scanAllUsers = vi.mocked(actualScanAllUsers);
const scanForUserByUsername = vi.mocked(actualScanForUser);

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

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should read user data from the event headers and store it in dynamo", async () => {
    scanAllUsers.mockResolvedValueOnce([]);

    const response = await createUser(mockUser);

    expect(response).toBe("User COLO Added!");

    expect(putUser).toHaveBeenCalledWith({
      ...mockUser,
      dateJoined: expect.stringMatching(ISO_DATE_REGEX),
      lastLogin: expect.stringMatching(ISO_DATE_REGEX),
      lastSynced: expect.stringMatching(ISO_DATE_REGEX),
      userId: "1",
    });
  });

  it("should assign the new user the next sequential ID", async () => {
    scanAllUsers.mockResolvedValueOnce([
      { userId: "10" },
      { userId: "30" },
      { userId: "20" },
    ]);

    const response = await createUser(mockUser);

    expect(response).toBe("User COLO Added!");

    expect(putUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "31",
      })
    );
  });

  it("should fail if the user has somehow created a Cognito account with no username", async () => {
    const invalidUser = { username: undefined } as any;

    const response = await createUser(invalidUser);

    expect(response).toBe("Please enter a username");
  });

  it("should do nothing if the user already exists", async () => {
    scanForUserByUsername.mockResolvedValueOnce(mockUser as AuthUser);

    const response = await createUser(mockUser);

    expect(response).toBe("User COLO already exists");

    expect(putUser).not.toHaveBeenCalled();
  });
});
