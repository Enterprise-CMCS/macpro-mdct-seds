import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as getUserById } from "./getUserById.ts";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { getUser as actualGetUser, AuthUser } from "../../storage/users.ts";

vi.mock("../../storage/users.ts", () => ({
  getUser: vi.fn(),
}));
const getUser = vi.mocked(actualGetUser);

const mockEvent = {
  pathParameters: {
    userId: "42",
  } as Record<string, string>,
} as APIGatewayProxyEvent;
const mockUser = {
  userId: "42",
  email: "user@test.com",
} as AuthUser;

describe("getUserById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch the requested user data from dynamo", async () => {
    handler.setupAdminUser();
    getUser.mockResolvedValueOnce(mockUser);

    const response = await getUserById(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockUser),
      })
    );
  });

  it("should return an error for invalid parameters", async () => {
    handler.setupAdminUser();

    const response = await getUserById({
      ...mockEvent,
      pathParameters: { userId: "zzz" },
    });

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return an error if the user cannot be found", async () => {
    handler.setupAdminUser();
    getUser.mockResolvedValueOnce(undefined);

    const response = await getUserById(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.NotFound);
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupBusinessUser();

    const response = await getUserById(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
