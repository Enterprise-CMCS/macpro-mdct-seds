import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "./handler-lib.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "../shared/types.ts";
import { StatusCodes } from "./response-lib.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockTokenUser = {
  sub: "mock-sub",
  "custom:ismemberof": "CHIP_D_USER_GROUP",
  role: "state",
};
const mockDbUser = {
  usernameSub: "mock-sub",
  role: "business",
};

const encodeJwt = (x: any) => `eyJhbGciOiJub25lIn0.${btoa(JSON.stringify(x))}.`;
const mockEvent = {
  headers: {
    "x-api-key": encodeJwt(mockTokenUser),
  } as Record<string, string>,
} as APIGatewayProxyEvent;

describe("handler-lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call the given lambda with the current user and parsed event", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockDbUser] });
    const parser = vi.fn().mockReturnValue("mock parse result");
    const lambda = vi.fn().mockResolvedValue("mock lambda result");

    const result = await handler(parser, lambda)(mockEvent);

    expect(mockScan).toHaveBeenCalledWith(
      {
        TableName: "local-auth-user",
        FilterExpression: "usernameSub = :usernameSub",
        ExpressionAttributeValues: {
          ":usernameSub": "mock-sub",
        },
      },
      expect.any(Function)
    );
    expect(parser).toHaveBeenCalledWith(mockEvent);
    expect(lambda).toHaveBeenCalledWith({
      parameters: "mock parse result",
      user: mockDbUser,
    });
    expect(result).toBe("mock lambda result");
  });

  it("should return an error if the user cannot be found", async () => {
    mockScan.mockResolvedValueOnce({ Items: [] });
    const parser = vi.fn().mockReturnValue("mock parse result");
    const lambda = vi.fn().mockResolvedValue("mock lambda result");

    const result = await handler(parser, lambda)(mockEvent);

    expect(result.statusCode).toBe(StatusCodes.Unauthenticated);
  });

  it("should parse the request body", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockDbUser] });
    const parser = vi.fn().mockReturnValue("mock parse result");
    const lambda = vi.fn().mockResolvedValue("mock lambda result");
    const payload = { foo: "bar" };
    const eventWithBody = {
      ...mockEvent,
      body: JSON.stringify(payload),
    };

    const result = await handler(parser, lambda)(eventWithBody);

    expect(lambda).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload })
    );
  });

  it("should sanitize the request body", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockDbUser] });
    const parser = vi.fn().mockReturnValue("mock parse result");
    const lambda = vi.fn().mockResolvedValue("mock lambda result");
    const payload = { foo: "bar<script>alert('pwnd')</script>" };
    const eventWithBody = {
      ...mockEvent,
      body: JSON.stringify(payload),
    };

    const result = await handler(parser, lambda)(eventWithBody);

    expect(lambda).toHaveBeenCalledWith(
      expect.objectContaining({ body: { foo: "bar" } })
    );
  });

  it("should return an error if the parameter parser fails", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockDbUser] });
    const parser = vi.fn().mockReturnValue(undefined);
    const lambda = vi.fn().mockResolvedValue("mock lambda result");

    const result = await handler(parser, lambda)(mockEvent);

    expect(result.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return an error if the lambda fails", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockDbUser] });
    const parser = vi.fn().mockReturnValue("mock parse result");
    const lambda = vi.fn().mockImplementation(() => {
      throw new Error("oops");
    });

    const result = await handler(parser, lambda)(mockEvent);

    expect(result).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: '"oops"',
      })
    );
  });

  it("should skip the AuthUser lookup for the getCurrentUser endpoint", async () => {
    mockScan.mockResolvedValueOnce({ Items: [mockDbUser] });
    const parser = vi.fn().mockReturnValue("mock parse result");
    const lambda = vi.fn().mockResolvedValue("mock lambda result");
    const getCurrentUserEvent = {
      ...mockEvent,
      path: "/getCurrentUser",
    };

    await handler(parser, lambda)(getCurrentUserEvent);

    expect(mockScan).not.toHaveBeenCalled();
    expect(lambda).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({
          // The role inferred from the token, not the actual role in the DB
          role: "state",
        }),
      })
    );
  });
});
