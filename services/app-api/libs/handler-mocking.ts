import { vi } from "vitest";
import actualHandler from "./handler-lib.ts";
import { AuthUser } from "../storage/users.ts";
import { badRequest } from "./response-lib.ts";
import * as logger from "./debug-lib.ts";

/*
 * Every endpoint exposed through http is wrapped in the handler-lib handler.
 * It parses the JWT, looks up the requesting user, sanitizes the body,
 * does a bunch of logging, and wraps the whole thing in a try-catch.
 *
 * For most unit tests, we don't want any of that.
 *
 * Importing this file immediately replaces the real handler with a simpler one.
 *   - The parameter parser is invoked on the event as normal;
 *     provide different pathParameters/queryParameters to test it.
 *   - The body is JSON parsed as usual.
 *   - Use the helpers exported below to mock out different users.
 *
 * NOTE: This file must be imported BEFORE importing the file being tested.
 */

vi.mock("./handler-lib", () => ({
  default: vi.fn(),
}));
const handler = vi.mocked(actualHandler);
handler.mockImplementation((parser, lambda) => {
  return async (evt: any) => {
    try {
      if (evt.body && "string" !== typeof evt.body) {
        throw new Error("Request body must be JSON stringified!");
      }

      const parameters = parser(evt);
      if (!parameters) return badRequest();

      return lambda({
        parameters,
        body: JSON.parse(evt.body ?? null),
        user: determineUser(),
      });
    } finally {
      logger.flush();
    }
  };
});

const today = new Date();
const lastMonth = new Date();
lastMonth.setDate(today.getDate() - 30);

const mockUser: AuthUser = {
  userId: "123",
  usernameSub: "mock-sub",
  username: "TEST",
  email: "Breonna.Tester@example.com",
  firstName: "Breonna",
  lastName: "Tester",
  // This invalid role forces explicit setups for any permission tests
  role: "invalid-role" as any,
  dateJoined: lastMonth.toISOString(),
  lastLogin: today.toISOString(),
};

const determineUser = vi.fn().mockReturnValue(mockUser);

export const setupAdminUser = () =>
  determineUser.mockReturnValue({ ...mockUser, role: "admin" });

export const setupBusinessUser = () =>
  determineUser.mockReturnValue({ ...mockUser, role: "business" });

export const setupStateUser = (state: string) =>
  determineUser.mockReturnValue({ ...mockUser, role: "state", state });
