import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as updateUser } from "./updateUser.ts";
import { scanForUserWithSub as actualScanForUserWithSub } from "../get/getCurrentUser.ts";
import {
  authorizeAnyUser as actualAuthorizeAnyUser,
  authorizeAdminOrUserWithEmail as actualAuthorizeAdminOrUserWithEmail,
  authorizeAdmin as actualAuthorizeAdmin,
} from "../../../auth/authConditions.ts";
import { AuthUser, putUser as actualPutUser } from "../../../storage/users.ts";
import { StatusCodes } from "../../../libs/response-lib.ts";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAnyUser: vi.fn(),
  authorizeAdminOrUserWithEmail: vi.fn(),
  authorizeAdmin: vi.fn(),
}));
const authorizeAnyUser = vi.mocked(actualAuthorizeAnyUser);
const authorizeAdminOrUserWithEmail = vi.mocked(
  actualAuthorizeAdminOrUserWithEmail
);
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

vi.mock("../../../storage/users.ts", () => ({
  putUser: vi.fn(),
}));
const putUser = vi.mocked(actualPutUser);

vi.mock("../get/getCurrentUser.ts", () => ({
  scanForUserWithSub: vi.fn(),
}));
const scanForUserWithSub = vi.mocked(actualScanForUserWithSub);

const mockUser = {
  userId: "42",
  username: "COLO",
  email: "stateuserCO@test.com",
  role: "state",
  state: "CO",
  lastLogin: "2025-12-16T23:00:32.442Z",
} as AuthUser;

const mockEvent = {
  body: JSON.stringify({
    ...mockUser,
    role: "business",
  }),
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateUser.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update the given user data", async () => {
    scanForUserWithSub.mockResolvedValueOnce(mockUser);

    const response = await updateUser(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(putUser).toHaveBeenCalledWith({
      userId: "42",
      username: "COLO",
      email: "stateuserCO@test.com",
      role: "business",
      state: "CO",
      lastLogin: "2025-12-16T23:00:32.442Z",
    });
  });

  it("should allow the state of a state user to be cleared", async () => {
    const mockEvent = {
      body: JSON.stringify({
        ...mockUser,
        state: undefined,
      }),
    };
    scanForUserWithSub.mockResolvedValueOnce(mockUser);

    const response = await updateUser(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(putUser).toHaveBeenCalledWith({
      userId: "42",
      username: "COLO",
      email: "stateuserCO@test.com",
      role: "state",
      state: undefined,
      lastLogin: "2025-12-16T23:00:32.442Z",
    });
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAnyUser.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });

  it("should return an error if the requesting user isn't an admin, or updating themselves", async () => {
    scanForUserWithSub.mockResolvedValueOnce(mockUser);
    authorizeAdminOrUserWithEmail.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateUser(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });

  it("should return an error if the requesting user is updating anything other than their state", async () => {
    scanForUserWithSub.mockResolvedValue(mockUser);
    authorizeAdmin.mockRejectedValue(new Error("Forbidden"));

    const expectFieldChangeToError = async (changedProperty) => {
      const evt = {
        body: JSON.stringify({ ...mockUser, ...changedProperty }),
      };
      const response = await updateUser(evt);
      expect(response.statusCode).toBe(StatusCodes.InternalServerError);
    };

    await expectFieldChangeToError({ username: "WISC" });
    await expectFieldChangeToError({ role: "admin" });
    await expectFieldChangeToError({ usernameSub: "4444-5555-6666-7777" });
    await expectFieldChangeToError({ state: "WI" });

    // Reset these mocks to no-ops
    scanForUserWithSub.mockReset().mockResolvedValue(undefined);
    authorizeAdmin.mockReset().mockResolvedValue();
  });

  it("should allow users to select a state, if they have not yet done so", async () => {
    scanForUserWithSub.mockResolvedValueOnce({ ...mockUser, state: undefined });
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));
    const evt = {
      body: JSON.stringify({ ...mockUser, state: "CO" }),
    };

    const response = await updateUser(evt);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    // We didn't exercise the mock rejection; reset the mock to no-op
    authorizeAdmin.mockReset().mockResolvedValue();
  });

  it("should reject invalid user payloads", async () => {
    scanForUserWithSub.mockResolvedValue(mockUser);

    const expectFieldChangeToError = async (payload) => {
      const evt = { body: JSON.stringify(payload) };
      const response = await updateUser(evt);
      expect(response.statusCode).toBe(StatusCodes.InternalServerError);
    };

    // Payload must exist
    await expectFieldChangeToError(null);

    // Role must be valid
    await expectFieldChangeToError({});
    await expectFieldChangeToError({ role: 1 });
    await expectFieldChangeToError({ role: 0 });
    await expectFieldChangeToError({ role: "super" });

    // State must be valid
    await expectFieldChangeToError({ role: "state", state: "" });
    await expectFieldChangeToError({ role: "state", state: "null" });
    await expectFieldChangeToError({ role: "state", state: [] });
    await expectFieldChangeToError({ role: "state", state: [0] });
    await expectFieldChangeToError({ role: "state", state: ["CO"] });

    // Reset these mocks to no-ops
    scanForUserWithSub.mockReset().mockResolvedValue(undefined);
  });
});
