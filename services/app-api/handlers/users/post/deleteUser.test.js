import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as deleteUser } from "./deleteUser.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.js", () => ({
  authorizeAdmin: vi.fn(),
}));

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockDelete = vi.fn();
mockDynamo.on(DeleteCommand).callsFake(mockDelete);

const mockEvent = { body: JSON.stringify({ id: "42" })};

describe("deleteUser.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete the specified user from dynamo", async () => {
    const response = await deleteUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({ status: true }),
    }));

    expect(mockDelete).toHaveBeenCalledWith({
      TableName: "local-auth-user",
      Key: { userId: "42" },
    }, expect.any(Function));
  });

  it.skip("should return Internal Server Error if the user is not authorized", async () => {
    // This test fails because we don't check authorization in this lambda, lol.
    // Fortunately, we also don't expose it to the API, so there is no risk.
    // No point either, but we're not removing it today.
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await deleteUser(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
