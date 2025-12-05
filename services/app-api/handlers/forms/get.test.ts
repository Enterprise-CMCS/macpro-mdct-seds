import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as get } from "./get.ts";
import { authorizeAdminOrUserForState } from "../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../auth/authConditions.ts", () => ({
  authorizeAdminOrUserForState: vi.fn(),
}));

const mockQuery = vi.fn();
const mockScan = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(QueryCommand).callsFake(mockQuery);
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockFormAnswer = {
  state_form: "CO-2025-F1-A",
  question: "mock-Question-Q1",
  rangeId: "0001",
  answer_entry: "CO-2025-F1-A-0001-Q1",
  rows: [{ rowNumber: 1 }],
};
const mockFormQuestion = {
  year: 2025,
  form: "F1",
};
const mockEvent = {
  pathParameters: {
    state: "CO",
    specifiedYear: "2025",
    quarter: "1",
    form: "F1",
  },
};

describe("get.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query Dynamo for for answers and questions", async () => {
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer], Count: 1 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await get(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        answers: [mockFormAnswer],
        questions: [mockFormQuestion],
      }),
    }));

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "local-form-answers",
      IndexName: "state-form-index",
      ExpressionAttributeValues: {
        ":answerFormID": "CO-2025-1-F1",
      },
      KeyConditionExpression: "state_form = :answerFormID",
    }, expect.any(Function));

    expect(mockScan).toHaveBeenCalledWith({
      TableName: "local-form-questions",
      ExpressionAttributeNames: { "#theYear": "year" },
      ExpressionAttributeValues: {
        ":specifiedYear": 2025,
        ":form": "F1",
      },
      FilterExpression: "form = :form and #theYear = :specifiedYear",
    }, expect.any(Function));
  });

  it("should return an error if no answers can be found", async () => {
    mockQuery.mockResolvedValueOnce({ Items: [], Count: 0 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await get(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({
        error: "Answers for Single form not found.",
      }),
    }));
  });

  it("should return an error if no questions can be found", async () => {
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer], Count: 1 });
    mockScan.mockResolvedValueOnce({ Items: [], Count: 0 });

    const response = await get(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({
        error: "Questions for Single form not found.",
      }),
    }));
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAdminOrUserForState.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await get(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
