import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as generateEnrollmentTotals } from "./generateEnrollmentTotals.ts";
import { writeAllStateForms as actualWriteAllStateForms } from "../../../storage/stateForms.ts";
import { authorizeAdmin as actualAuthorizeAdmin } from "../../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { StatusCodes } from "../../../libs/response-lib.ts";

vi.mock("../../../storage/stateForms.ts", () => ({
  writeAllStateForms: vi.fn(),
}));
const writeAllStateForms = vi.mocked(actualWriteAllStateForms);

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdmin: vi.fn(),
}));
const authorizeAdmin = vi.mocked(actualAuthorizeAdmin);

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockQuery = vi.fn();
mockDynamo.on(QueryCommand).callsFake(mockQuery);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockEvent = {};

describe("generateEnrollmentTotals.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query answers from dynamo, and write totals back", async () => {
    mockScan.mockResolvedValueOnce({
      Count: 1,
      Items: [
        { state_form: "CO-2025-4-21E", form: "21E", year: 2025 },
        { state_form: "CO-2025-4-64.21E", form: "64.21E", year: 2025 },
      ],
    });
    let queryCount = 0;
    mockQuery.mockImplementation((params) => {
      queryCount += 1;
      return {
        Count: 2,
        Items: [
          {
            rows: [
              {
                col2: (queryCount * 12 + 2).toString(),
                col3: (queryCount * 12 + 3).toString(),
                col4: (queryCount * 12 + 4).toString(),
              },
              {
                col2: (queryCount * 12 + 5).toString(),
                col3: (queryCount * 12 + 6).toString(),
                col4: (queryCount * 12 + 7).toString(),
              },
            ],
          },
          {
            rows: [
              {
                col2: (queryCount * 12 + 8).toString(),
                col3: (queryCount * 12 + 9).toString(),
                col4: (queryCount * 12 + 10).toString(),
              },
              {
                col2: (queryCount * 12 + 11).toString(),
                col3: (queryCount * 12 + 12).toString(),
                col4: (queryCount * 12 + 13).toString(),
              },
            ],
          },
        ],
      };
    });

    const response = await generateEnrollmentTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-state-forms",
        FilterExpression: "quarter = :quarter AND form IN (:f1, :f2)",
        ExpressionAttributeValues: {
          ":quarter": 4,
          ":f1": "21E",
          ":f2": "64.21E",
        },
        Select: "ALL_ATTRIBUTES",
        ConsistentRead: true,
      }),
      expect.any(Function)
    );

    expect(mockQuery).toHaveBeenCalledTimes(10);
    expect(mockQuery).toHaveBeenCalledWith(
      {
        TableName: "local-form-answers",
        ExpressionAttributeValues: { ":answerEntry": "CO-2025-4-21E-0000-07" },
        KeyConditionExpression: "answer_entry = :answerEntry",
        ExclusiveStartKey: undefined,
      },
      expect.any(Function)
    );
    const expectedEntries = [
      "CO-2025-4-21E-0000-07",
      "CO-2025-4-21E-0001-07",
      "CO-2025-4-21E-0105-07",
      "CO-2025-4-21E-0612-07",
      "CO-2025-4-21E-1318-07",
      "CO-2025-4-64.21E-0000-07",
      "CO-2025-4-64.21E-0001-07",
      "CO-2025-4-64.21E-0105-07",
      "CO-2025-4-64.21E-0612-07",
      "CO-2025-4-64.21E-1318-07",
    ];
    const actualEntries = mockQuery.mock.calls.map(
      (call) => call[0].ExpressionAttributeValues[":answerEntry"]
    );
    expect(actualEntries).toEqual(expectedEntries);

    expect(writeAllStateForms).toHaveBeenCalledWith([
      {
        state_form: "CO-2025-4-21E",
        form: "21E",
        year: 2025,
        enrollmentCounts: {
          type: "separate",
          year: 2025,
          count: 2610,
        },
      },
      {
        state_form: "CO-2025-4-64.21E",
        form: "64.21E",
        year: 2025,
        enrollmentCounts: {
          type: "expansion",
          year: 2025,
          count: 6210,
        },
      },
    ]);
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await generateEnrollmentTotals(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
