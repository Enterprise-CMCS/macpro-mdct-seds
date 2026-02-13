import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as getForm } from "./getForm.ts";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent, FormStatus } from "../../shared/types.ts";
import { StatusCodes } from "../../libs/response-lib.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);
const mockQuery = vi.fn();
mockDynamo.on(QueryCommand).callsFake(mockQuery);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockStateForm = {
  state_form: "CO-2025-21E-A",
  status_id: FormStatus.InProgress,
};
const mockFormAnswer = {
  state_form: "CO-2025-21E-A",
  question: "mock-Question-Q1",
  rangeId: "0001",
  answer_entry: "CO-2025-21E-A-0001-Q1",
  rows: [{ rowNumber: 1 }],
};
const mockFormQuestion = {
  year: 2025,
  form: "21E",
};
const mockEvent = {
  pathParameters: {
    state: "CO",
    year: "2025",
    quarter: "1",
    form: "21E",
  } as Record<string, string>,
} as APIGatewayProxyEvent;

describe("getForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query Dynamo for form status, answers and questions", async () => {
    handler.setupStateUser("CO");
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer], Count: 1 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await getForm(mockEvent);

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
          ":state_form": "CO-2025-1-21E",
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
          ":form": "21E",
        },
        FilterExpression: "form = :form and #year = :year",
      },
      expect.any(Function)
    );
  });

  it("should continue even if no answers can be found", async () => {
    handler.setupBusinessUser();
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });
    mockQuery.mockResolvedValueOnce({ Items: [], Count: 0 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await getForm(mockEvent);

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
    handler.setupAdminUser;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer] });
    mockScan.mockResolvedValueOnce({ Items: [] });

    const response = await getForm(mockEvent);

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

  it("should return an error if the form does not exist", async () => {
    handler.setupStateUser("CO");
    mockGet.mockResolvedValueOnce({});
    mockQuery.mockResolvedValueOnce({ Items: [mockFormAnswer], Count: 1 });
    mockScan.mockResolvedValueOnce({ Items: [mockFormQuestion], Count: 1 });

    const response = await getForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.NotFound);
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("TX");

    const response = await getForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
