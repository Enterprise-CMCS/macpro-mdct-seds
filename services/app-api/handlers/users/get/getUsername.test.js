import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as getUsername } from "./getUsername.js";
import { getCurrentUserInfo } from "../../../auth/cognito-auth.js";

vi.mock("../../../auth/cognito-auth.js", () => ({
  getCurrentUserInfo: vi.fn(),
}));

const mockEvent = { foo: "bar" };
const mockUser = { id: 42 };

describe("getUsername.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user info decoded from the event headers", async () => {
    getCurrentUserInfo.mockResolvedValueOnce(mockUser);

    const response = await getUsername(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify(mockUser),
    }));
  });
});
