import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as get } from "./get.ts";
import { authorizeAdminOrUserForState as actualAuthorizeAdminOrUserForState } from "../../../auth/authConditions.ts";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { FormStatus } from "../../../shared/types.ts";
import { StatusCodes } from "../../../libs/response-lib.ts";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeAdminOrUserForState: vi.fn(),
}));
const authorizeAdminOrUserForState = vi.mocked(
  actualAuthorizeAdminOrUserForState
);

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);
const mockQuery = vi.fn();
mockDynamo.on(QueryCommand).callsFake(mockQuery);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockStateForm = {
  state_form: "CO-2025-F1-A",
  status_id: FormStatus.InProgress,
};
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
    year: "2025",
    quarter: "1",
    form: "F1",
  },
};

describe("get.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query Dynamo for form status, answers and questions", async () => {
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer], Count: 1 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await get(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify({
          statusData: mockStateForm,
          questions: [mockFormQuestion],
          answers: [mockFormAnswer],
        }),
      })
    );

    expect(mockQuery).toHaveBeenCalledWith(
      {
        TableName: "local-form-answers",
        IndexName: "state-form-index",
        ExpressionAttributeValues: {
          ":state_form": "CO-2025-1-F1",
        },
        KeyConditionExpression: "state_form = :state_form",
      },
      expect.any(Function)
    );

    expect(mockScan).toHaveBeenCalledWith(
      {
        TableName: "local-form-questions",
        ExpressionAttributeNames: { "#year": "year" },
        ExpressionAttributeValues: {
          ":year": 2025,
          ":form": "F1",
        },
        FilterExpression: "form = :form and #year = :year",
      },
      expect.any(Function)
    );
  });

  it("should continue even if no answers can be found", async () => {
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });
    mockQuery.mockResolvedValueOnce({ Items: [], Count: 0 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await get(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify({
          statusData: mockStateForm,
          questions: [mockFormQuestion],
          answers: [],
        }),
      })
    );
  });

  it("should continue even if no questions can be found", async () => {
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer] });
    mockScan.mockResolvedValueOnce({ Items: [] });

    const response = await get(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify({
          statusData: mockStateForm,
          questions: [],
          answers: [mockFormAnswer],
        }),
      })
    );
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeAdminOrUserForState.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await get(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.InternalServerError,
        body: JSON.stringify({ error: "Forbidden" }),
      })
    );
  });
});
