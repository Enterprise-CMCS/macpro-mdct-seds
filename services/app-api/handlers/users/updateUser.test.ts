import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as updateUser } from "./updateUser.ts";
import {
  AuthUser,
  putUser as actualPutUser,
  scanForUserWithSub as actualScanForUserWithSub,
} from "../../storage/users.ts";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

vi.mock("../../storage/users.ts", () => ({
  scanForUserWithSub: vi.fn(),
  putUser: vi.fn(),
}));
const scanForUserWithSub = vi.mocked(actualScanForUserWithSub);
const putUser = vi.mocked(actualPutUser);

const encodeJwt = (x: any) => `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify(x))}.`;
const mockEvent = {
  headers: {
    "x-api-key": encodeJwt({ "custom:ismemberof": "CHIP_D_USER_GROUP" }),
  } as Record<string, string>,
} as APIGatewayProxyEvent;

describe("updateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update the given user data", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({ role: "admin" } as AuthUser) // Requesting user
      .mockResolvedValueOnce({ role: "business" } as AuthUser); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub",
        role: "state",
        state: "CO",
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(putUser).toHaveBeenCalledWith({
      role: "state",
      state: "CO",
    });
  });

  it("should allow the state of a state user to be cleared", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({ role: "admin" } as AuthUser) // Requesting user
      .mockResolvedValueOnce({ role: "state", state: "CO" } as AuthUser); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub",
        role: "state",
        // no state specified
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(putUser).toHaveBeenCalledWith({
      role: "state",
      // state wiped out
    });
  });

  it("should allow a state user to fill in their state", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({
        role: "state",
        usernameSub: "mock-sub",
      } as AuthUser) // Requesting user
      .mockResolvedValueOnce({
        usernameSub: "mock-sub",
        role: "state",
      } as AuthUser); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub",
        role: "state",
        state: "CO",
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(putUser).toHaveBeenCalledWith({
      usernameSub: "mock-sub",
      role: "state",
      state: "CO",
    });
  });

  it("should return an error if the user does not exist", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({ role: "admin" } as AuthUser) // Requesting user
      .mockResolvedValueOnce(undefined); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub",
        role: "state",
        state: "CO",
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.NotFound);

    expect(putUser).not.toHaveBeenCalled();
  });

  it("should not allow a state user to change their state", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({
        role: "state",
        usernameSub: "mock-sub",
      } as AuthUser) // Requesting user
      .mockResolvedValueOnce({
        usernameSub: "mock-sub",
        role: "state",
        state: "TX",
      } as AuthUser); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub",
        role: "state",
        state: "CO",
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.Forbidden);

    expect(putUser).not.toHaveBeenCalled();
  });

  it("should not allow a state user to change their role", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({
        role: "state",
        usernameSub: "mock-sub",
      } as AuthUser) // Requesting user
      .mockResolvedValueOnce({
        usernameSub: "mock-sub",
        role: "state",
      } as AuthUser); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub",
        role: "admin",
        state: "CO",
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.Forbidden);

    expect(putUser).not.toHaveBeenCalled();
  });

  it("should not allow non-admins to modify other users", async () => {
    scanForUserWithSub
      .mockResolvedValueOnce({
        role: "state",
        usernameSub: "mock-sub-1",
      } as AuthUser) // Requesting user
      .mockResolvedValueOnce({
        usernameSub: "mock-sub-2",
        role: "state",
      } as AuthUser); // Record being modified

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify({
        usernameSub: "mock-sub-2",
        role: "state",
        state: "CO",
      }),
    });

    expect(response.statusCode).toBe(StatusCodes.Forbidden);

    expect(putUser).not.toHaveBeenCalled();
  });

  it.each([
    { reason: "missing", body: null },
    { reason: "no sub", body: {} },
    { reason: "invalid sub", body: { usernameSub: 123 } },
    { reason: "no role", body: { usernameSub: "mock-sub" } },
    { reason: "invalid role", body: { usernameSub: "mock-sub", role: "none" } },
    {
      reason: "invalid state",
      body: { usernameSub: "mock-sub", role: "state", state: "zzz" },
    },
  ])("Should reject invalid body ($reason)", async ({ body }) => {
    scanForUserWithSub.mockResolvedValueOnce({ role: "admin" } as AuthUser); // Requesting user

    const response = await updateUser({
      ...mockEvent,
      body: JSON.stringify(body),
    });

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
  });
});
