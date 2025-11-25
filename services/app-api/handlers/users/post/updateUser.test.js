import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as updateUser } from "./updateUser.js";
import { scanForUserWithSub } from "../get/getCurrentUser.js";
import {
  authorizeAnyUser,
  authorizeAdminOrUserWithEmail,
  authorizeAdmin,
} from "../../../auth/authConditions.js";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.js", () => ({
  authorizeAnyUser: vi.fn(),
  authorizeAdminOrUserWithEmail: vi.fn(),
  authorizeAdmin: vi.fn(),
}));

vi.mock("../get/getCurrentUser.js", () => ({
  scanForUserWithSub: vi.fn(),
}));

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockUpdate = vi.fn();
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

const mockUser = {
  userId: "42",
  username: "COLO",
  email: "stateuserCO@test.com",
  role: "state",
  states: ["CO"]
};

const mockEvent = {
  body: JSON.stringify({
    ...mockUser,
    role: "business",
  }),
};

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateUser.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update the given user data", async () => {
    scanForUserWithSub.mockResolvedValueOnce(mockUser);
    mockUpdate.mockResolvedValueOnce({ update: "complete" });

    const response = await updateUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({ update: "complete" }),
    }));

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: "local-auth-user",
      Key: { userId: "42" },
      UpdateExpression: "SET #r = :role, states = :states, lastLogin = :lastLogin",
      ExpressionAttributeNames: { "#r": "role" },
      ExpressionAttributeValues: {
        ":role": "business",
        ":states": ["CO"],
        ":lastLogin": expect.stringMatching(ISO_DATE_REGEX),
      },
      ReturnValues: "ALL_NEW",
    }, expect.any(Function));
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAnyUser.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });

  it("should return an error if the requesting user isn't an admin, or updating themselves", async () => {
    scanForUserWithSub.mockResolvedValueOnce(mockUser);
    authorizeAdminOrUserWithEmail.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await updateUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });

  it("should return an error if the requesting user is updating anything other than their state", async () => {
    scanForUserWithSub.mockResolvedValue(mockUser);
    authorizeAdmin.mockRejectedValue(new Error("Forbidden"));

    const expectFieldChangeToError = async (changedProperty) => {
      const evt = {
        body: JSON.stringify({...mockUser, ...changedProperty}),
      };
      const response = await updateUser(evt);
      expect(response.statusCode).toBe(500);
    }
    
    await expectFieldChangeToError({ username: "WISC" });
    await expectFieldChangeToError({ role: "admin" });
    await expectFieldChangeToError({ usernameSub: "4444-5555-6666-7777" });
    await expectFieldChangeToError({ states: ["WI"] });

    // Reset these mocks to no-ops
    scanForUserWithSub.mockReset().mockResolvedValue();
    authorizeAdmin.mockReset().mockResolvedValue();
  });

  it("should allow users to select a state, if they have not yet done so", async () => {
    scanForUserWithSub.mockResolvedValueOnce({ ...mockUser, states: [] });
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));
    const evt = {
      body: JSON.stringify({...mockUser, states: ["CO"] }),
    };

    const response = await updateUser(evt);

    expect(response.statusCode).toBe(200);

    // We didn't exercise the mock rejection; reset the mock to no-op
    authorizeAdmin.mockReset().mockResolvedValue();
  });

  it("should reject invalid user payloads", async () => {
    scanForUserWithSub.mockResolvedValue(mockUser);

    const expectFieldChangeToError = async (payload) => {
      const evt = { body: JSON.stringify(payload) };
      const response = await updateUser(evt);
      expect(response.statusCode).toBe(500);
    }

    // Payload must exist
    await expectFieldChangeToError(null);

    // Role must be valid
    await expectFieldChangeToError({});
    await expectFieldChangeToError({ role: 1 });
    await expectFieldChangeToError({ role: 0 });
    await expectFieldChangeToError({ role: "super" });

    // States must be valid
    await expectFieldChangeToError({ role: "state", states: "CO" });
    await expectFieldChangeToError({ role: "state", states: [0] });
    await expectFieldChangeToError({ role: "state", states: ["CO", 42] });
    await expectFieldChangeToError({ role: "state", states: ["eric"] });

    // Reset these mocks to no-ops
    scanForUserWithSub.mockReset().mockResolvedValue();
  });
});
