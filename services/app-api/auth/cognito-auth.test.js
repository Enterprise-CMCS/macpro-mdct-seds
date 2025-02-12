import { describe, expect, it, vi } from "vitest";
import { getCurrentUserInfo } from "./cognito-auth.js";
import { getUserDetailsFromEvent } from "../libs/authorization.js";
import { obtainUserByEmail } from "../handlers/users/post/obtainUserByEmail.js";

vi.mock("../libs/authorization.js", () => ({
  getUserDetailsFromEvent: vi.fn(),
}));

vi.mock("../handlers/users/post/obtainUserByEmail.js", () => ({
  obtainUserByEmail: vi.fn(),
}));

const mockEvent = {};
const mockUser = {
  email: "stateuserCO@test.com",
  role: "state",
  states: ["CO"],
};

describe("getCurrentUserInfo", () => {
  it("should return the user if they can be found", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce({ email: mockUser.email });
    obtainUserByEmail.mockResolvedValueOnce({ Items: [mockUser] });

    const response = await getCurrentUserInfo(mockEvent);

    expect(response).toEqual({
      status: "success",
      data: mockUser,
    });
    expect(obtainUserByEmail).toHaveBeenCalledWith(mockUser.email);
  });

  it("should return a shell user if none can be found", async () => {
    getUserDetailsFromEvent.mockResolvedValueOnce({ email: mockUser.email });
    obtainUserByEmail.mockResolvedValueOnce(undefined);

    const response = await getCurrentUserInfo(mockEvent);

    expect(response).toEqual({
      data: {
        email: mockUser.email,
      }
    });
    expect(obtainUserByEmail).toHaveBeenCalledWith(mockUser.email);
  });

  it("should throw if token cannot be decoded", async () => {
    getUserDetailsFromEvent.mockRejectedValueOnce("nope");

    await expect(getCurrentUserInfo(mockEvent)).rejects.toThrow();
  });
});
