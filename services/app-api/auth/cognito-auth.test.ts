import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUserInfo } from "./cognito-auth.ts";
import { 
  getUserDetailsFromEvent as actualGetUserDetailsFromEvent
} from "../libs/authorization.ts";
import {
  scanForUserWithSub as actualScanForUserWithSub
} from "../handlers/users/get/getCurrentUser.ts";
import { AuthUser } from "../storage/users.ts";

vi.mock("../libs/authorization.ts", () => ({
  getUserDetailsFromEvent: vi.fn(),
}));
const getUserDetailsFromEvent = vi.mocked(actualGetUserDetailsFromEvent);

vi.mock("../handlers/users/get/getCurrentUser.ts", () => ({
  scanForUserWithSub: vi.fn(),
}));
const scanForUserWithSub = vi.mocked(actualScanForUserWithSub);

const mockEvent = {};
const mockUser = {
  email: "stateuserCO@test.com",
  role: "state",
  state: "CO",
  usernameSub: "mock-sub"
} as AuthUser;

describe("getCurrentUserInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the user if they can be found", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce({
      usernameSub: mockUser.usernameSub
    } as any);
    scanForUserWithSub.mockResolvedValueOnce(mockUser);

    const response = await getCurrentUserInfo(mockEvent);

    expect(response).toEqual({
      status: "success",
      data: mockUser,
    });
    expect(scanForUserWithSub).toHaveBeenCalledWith(mockUser.usernameSub)
  });

  it("should return a shell user if none can be found", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce({
      email: mockUser.email
    } as any);
    scanForUserWithSub.mockResolvedValueOnce(undefined);

    const response = await getCurrentUserInfo(mockEvent);

    expect(response).toEqual({
      data: {
        email: mockUser.email,
      }
    });
  });

  it("should throw if token cannot be decoded", async () => {
    getUserDetailsFromEvent.mockRejectedValueOnce("nope");

    await expect(getCurrentUserInfo(mockEvent)).rejects.toThrow();
  });
});
