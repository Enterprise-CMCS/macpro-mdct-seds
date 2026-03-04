import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as updateForm } from "./updateForm.ts";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent, FormStatus } from "../../shared/types.ts";
import { StateForm } from "../../storage/stateForms.ts";
import { FormAnswer } from "../../storage/formAnswers.ts";
import { StatusCodes } from "../../libs/response-lib.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockGet = vi.fn();
mockDynamo.on(GetCommand).callsFake(mockGet);
const mockQuery = vi.fn();
mockDynamo.on(QueryCommand).callsFake(mockQuery);
const mockUpdate = vi.fn();
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

const mockFormAnswer1 = {
  state_form: "CO-2025-1-GRE",
  question: "mock-Question-Q1",
  rangeId: "0001",
  answer_entry: "CO-2025-1-GRE-0001-Q1",
  rows: [
    { col1: 12, col2: null, col3: null, col4: null, col5: null, col6: null },
  ],
} as FormAnswer;
const mockFormAnswer2 = {
  state_form: "CO-2025-1-GRE",
  question: "mock-Question-Q1",
  rangeId: "0105",
  answer_entry: "CO-2025-1-GRE-0105-Q1",
  rows: [
    { col1: 23, col2: null, col3: null, col4: null, col5: null, col6: null },
  ],
} as FormAnswer;
const mockFormAnswer3 = {
  state_form: "CO-2025-1-GRE",
  question: "mock-Question-Q1",
  rangeId: "0618",
  answer_entry: "CO-2025-1-GRE-0618-Q1",
  rows: [
    { col1: 34, col2: null, col3: null, col4: null, col5: null, col6: null },
  ],
} as FormAnswer;
const mockStatusData = {
  state_form: "CO-2025-1-GRE",
  status_id: FormStatus.InProgress,
  state_comments: [{ type: "text_multiline", entry: "mock state comment" }],
  last_modified: new Date().toISOString(),
} as StateForm;
const mockStateForm = {
  status_id: FormStatus.InProgress,
  status_modified_by: "PREV",
  status_date: "2025-02-02T19:41:00.770Z",
} as StateForm;
const mockPathParams = {
  state: "CO",
  year: "2025",
  quarter: "1",
  form: "GRE",
} as Record<string, string>;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update form answers and status data", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1, mockFormAnswer2],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockUpdate).toHaveBeenCalledTimes(3);
    expect(mockUpdate).toHaveBeenCalledWith(
      {
        TableName: "local-form-answers",
        Key: { answer_entry: "CO-2025-1-GRE-0001-Q1" },
        UpdateExpression:
          "SET #r = :rows, last_modified_by = :last_modified_by, last_modified = :last_modified",
        ExpressionAttributeValues: {
          // Note that null values have been replaced with zeroes
          ":rows": [{ col1: 12, col2: 0, col3: 0, col4: 0, col5: 0, col6: 0 }],
          ":last_modified_by": "TEST",
          ":last_modified": expect.stringMatching(ISO_DATE_REGEX),
        },
        ExpressionAttributeNames: { "#r": "rows" },
        ReturnValues: "ALL_NEW",
      },
      expect.any(Function)
    );
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-form-answers",
        Key: { answer_entry: "CO-2025-1-GRE-0105-Q1" },
        ExpressionAttributeValues: expect.objectContaining({
          // Note that null values have been replaced with zeroes
          ":rows": [{ col1: 23, col2: 0, col3: 0, col4: 0, col5: 0, col6: 0 }],
        }),
      }),
      expect.any(Function)
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      {
        TableName: "local-state-forms",
        Key: { state_form: "CO-2025-1-GRE" },
        UpdateExpression:
          "SET last_modified_by = :last_modified_by, last_modified = :last_modified, status_modified_by = :status_modified_by, status_date = :status_date, status_id = :status_id, state_comments = :state_comments",
        ExpressionAttributeValues: {
          ":last_modified_by": "TEST",
          ":last_modified": expect.stringMatching(ISO_DATE_REGEX),
          ":status_modified_by": "PREV",
          ":status_date": "2025-02-02T19:41:00.770Z",
          ":status_id": FormStatus.InProgress,
          ":state_comments": [
            {
              type: "text_multiline",
              entry: "mock state comment",
            },
          ],
        },
        ReturnValues: "ALL_NEW",
      },
      expect.any(Function)
    );
  });

  it("should sort answers by answer_entry", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer2, mockFormAnswer3, mockFormAnswer1],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);
    const savedAnswerEntries = mockUpdate.mock.calls
      .filter((call) => call[0].TableName === "local-form-answers")
      .map((call) => call[0].Key.answer_entry);
    const expectedAnswerEntries = [
      "CO-2025-1-GRE-0001-Q1",
      "CO-2025-1-GRE-0105-Q1",
      "CO-2025-1-GRE-0618-Q1",
    ];
    expect(savedAnswerEntries).toEqual(expectedAnswerEntries);
  });

  it("should return an error if the form being updated cannot be found", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({});

    await expect(updateForm(mockEvent)).rejects.toThrow("State Form Not Found");

    // ONE WOULD HOPE that we wouldn't perform any update...
    // But we update form-answers before we check state-forms.
    // TODO: Fix that! And then uncomment this assertion.
    // expect(mockUpdate).toHaveBeenCalledTimes(0);
  });

  it("should update the status tracking fields if status_id changes", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1],
        statusData: {
          ...mockStatusData,
          status_id: FormStatus.FinalCert,
        },
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        ExpressionAttributeValues: expect.objectContaining({
          ":status_id": FormStatus.FinalCert,
          ":status_modified_by": "TEST",
          ":status_date": expect.stringMatching(ISO_DATE_REGEX),
        }),
      }),
      expect.any(Function)
    );
  });

  it("should perform special calculations for question 05", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [
          {
            state_form: "CO-2025-1-GRE",
            question: "mock-Question-01",
            rangeId: "0001",
            answer_entry: "CO-2025-1-GRE-0001-01",
            rows: [
              { col1: "", col2: "", col3: "", col4: "", col5: "", col6: "" },
              { col1: "", col2: 1, col3: 2, col4: 3, col5: 4, col6: 5 },
              { col1: "", col2: 6, col3: 7, col4: 8, col5: 9, col6: 10 },
              { col1: "", col2: 11, col3: 12, col4: 13, col5: 14, col6: 15 },
            ],
          },
          {
            state_form: "CO-2025-1-GRE",
            question: "mock-Question-04",
            rangeId: "0001",
            answer_entry: "CO-2025-1-GRE-0001-04",
            rows: [
              { col1: "", col2: "", col3: "", col4: "", col5: "", col6: "" },
              { col1: "", col2: 21, col3: 22, col4: 23, col5: 24, col6: 25 },
              { col1: "", col2: 26, col3: 27, col4: 28, col5: 29, col6: 30 },
              { col1: "", col2: 31, col3: 32, col4: 33, col5: 34, col6: 35 },
            ],
          },
          {
            state_form: "CO-2025-1-GRE",
            question: "mock-Question-05",
            rangeId: "0001",
            answer_entry: "CO-2025-1-GRE-0001-05",
            rows: [
              { col1: "", col2: "", col3: "", col4: "", col5: "", col6: "" },
              {
                col1: "",
                col2: [{ answer: null }],
                col3: [{ answer: null }],
                col4: [{ answer: null }],
                col5: [{ answer: null }],
                col6: [{ answer: null }],
              },
              {
                col1: "",
                col2: [{ answer: null }],
                col3: [{ answer: null }],
                col4: [{ answer: null }],
                col5: [{ answer: null }],
                col6: [{ answer: null }],
              },
              {
                col1: "",
                col2: [{ answer: null }],
                col3: [{ answer: null }],
                col4: [{ answer: null }],
                col5: [{ answer: null }],
                col6: [{ answer: null }],
              },
            ],
          },
        ],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-form-answers",
        Key: { answer_entry: "CO-2025-1-GRE-0001-05" },
        ExpressionAttributeValues: expect.objectContaining({
          ":rows": [
            { col1: "", col2: "", col3: "", col4: "", col5: "", col6: "" },
            {
              col1: "",
              col2: [{ answer: "21.0" }],
              col3: [{ answer: "11.0" }],
              col4: [{ answer: "7.7" }],
              col5: [{ answer: "6.0" }],
              col6: [{ answer: "5.0" }],
            },
            {
              col1: "",
              col2: [{ answer: "4.3" }],
              col3: [{ answer: "3.9" }],
              col4: [{ answer: "3.5" }],
              col5: [{ answer: "3.2" }],
              col6: [{ answer: "3.0" }],
            },
            {
              col1: "",
              col2: [{ answer: "2.8" }],
              col3: [{ answer: "2.7" }],
              col4: [{ answer: "2.5" }],
              col5: [{ answer: "2.4" }],
              col6: [{ answer: "2.3" }],
            },
          ],
        }),
      }),
      expect.any(Function)
    );
  });

  it("should update ONLY status data if the requestor is a business user", async () => {
    handler.setupBusinessUser();
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1, mockFormAnswer2],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockUpdate).toHaveBeenCalledTimes(1);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: "local-state-forms",
        ExpressionAttributeValues: expect.objectContaining({
          ":last_modified_by": "TEST",
        }),
      }),
      expect.any(Function)
    );
  });

  it("should return an error if the body statusData does not match the path", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1, mockFormAnswer2],
        statusData: { ...mockStatusData, state_form: "TX-2026-1-21E" },
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
  });

  it("should return an error if the body formAnswers do not match the path", async () => {
    handler.setupStateUser("CO");
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [
          mockFormAnswer1,
          { ...mockFormAnswer2, state_form: "TX-2026-1-21E" },
        ],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;
    mockGet.mockResolvedValueOnce({ Item: mockStateForm });

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.BadRequest);
  });

  it.each([
    { reason: "no body", body: null },
    { reason: "no statusData", body: { formAnswers: [mockFormAnswer1] } },
    {
      reason: "no status state_form",
      body: {
        statusData: { ...mockStatusData, state_form: null },
        formAnswers: [mockFormAnswer1],
      },
    },
    {
      reason: "no status status_id",
      body: {
        statusData: { ...mockStatusData, status_id: null },
        formAnswers: [mockFormAnswer1],
      },
    },
    {
      reason: "invalid status status_id",
      body: {
        statusData: { ...mockStatusData, status_id: 9 },
        formAnswers: [mockFormAnswer1],
      },
    },
    {
      reason: "no status state_comments",
      body: {
        statusData: { ...mockStatusData, state_comments: null },
        formAnswers: [mockFormAnswer1],
      },
    },
    {
      reason: "invalid status state_comments type",
      body: {
        statusData: { ...mockStatusData, state_comments: [{ type: "z" }] },
        formAnswers: [mockFormAnswer1],
      },
    },
    {
      reason: "invalid status state_comments entry",
      body: {
        statusData: {
          ...mockStatusData,
          state_comments: [{ type: "text_multiline", entry: false }],
        },
        formAnswers: [mockFormAnswer1],
      },
    },
    {
      reason: "no formAnswers",
      body: {
        statusData: mockStatusData,
        formAnswers: null,
      },
    },
    {
      reason: "formAnswer not an object",
      body: {
        statusData: mockStatusData,
        formAnswers: [123],
      },
    },
    {
      reason: "formAnswer invalid state_form",
      body: {
        statusData: mockStatusData,
        formAnswers: [{ ...mockFormAnswer1, state_form: "z" }],
      },
    },
    {
      reason: "formAnswer invalid question",
      body: {
        statusData: mockStatusData,
        formAnswers: [{ ...mockFormAnswer1, question: 4 }],
      },
    },
    {
      reason: "formAnswer invalid rangeId",
      body: {
        statusData: mockStatusData,
        formAnswers: [{ ...mockFormAnswer1, rangeId: 1234 }],
      },
    },
    {
      reason: "formAnswer missing rows",
      body: {
        statusData: mockStatusData,
        formAnswers: [{ ...mockFormAnswer1, rows: null }],
      },
    },
    {
      reason: "formAnswer wrong type",
      body: {
        statusData: mockStatusData,
        formAnswers: [
          {
            ...mockFormAnswer1,
            rows: [null],
          },
        ],
      },
    },
    {
      reason: "formAnswer missing columns",
      body: {
        statusData: mockStatusData,
        formAnswers: [
          {
            ...mockFormAnswer1,
            rows: [{}],
          },
        ],
      },
    },
  ])(
    "should return an error if the body is invalid ($reason)",
    async ({ reason, body }) => {
      handler.setupStateUser("CO");
      const mockEvent = {
        body: JSON.stringify(body),
        pathParameters: mockPathParams,
      } as APIGatewayProxyEvent;
      mockGet.mockResolvedValueOnce({ Item: mockStateForm });

      const response = await updateForm(mockEvent);

      expect(response.statusCode).toBe(StatusCodes.BadRequest);
    }
  );

  it("should return an error if the user does not have permissions", async () => {
    handler.setupAdminUser();
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1],
        statusData: mockStatusData,
      }),
      pathParameters: mockPathParams,
    } as APIGatewayProxyEvent;

    const response = await updateForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
