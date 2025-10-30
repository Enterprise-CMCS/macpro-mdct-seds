import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as getFormTypes } from "./getFormTypes.js";
import { authorizeAnyUser } from "../../../auth/authConditions.js";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../../auth/authConditions.js", () => ({
  authorizeAnyUser: vi.fn(),
}));

const mockScan = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockTemplate = {
  mockTemplateProp: "mockTemplateValue",
};

const mockEvent = {};

describe("getFormTypes.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for the requested data", async () => {
    const formA = { form: "A" };
    const formB = { form: "B" };
    mockScan.mockResolvedValueOnce({ Count: 2, Items: [formA, formB] });

    const response = await getFormTypes(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: JSON.stringify([formA, formB]),
      })
    );

    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-forms",
        Select: "ALL_ATTRIBUTES",
      }),
      expect.any(Function)
    );
  });

  it("should return Internal Server Error if the user is not valid", async () => {
    authorizeAnyUser.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await getFormTypes(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 500,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
