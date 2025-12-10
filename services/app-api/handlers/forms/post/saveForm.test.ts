import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as saveForm } from "./saveForm.ts";
import {
  authorizeUserForState as actualAuthorizeUserForState
} from "../../../auth/authConditions.ts";
import {
  getCurrentUserInfo as actualGetCurrentUserInfo
} from "../../../auth/cognito-auth.ts";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { FormStatus } from "../../../shared/types.ts";
import { AuthUser } from "../../../storage/users.ts";
import { StateForm } from "../../../storage/stateForms.ts";
import { FormAnswer } from "../../../storage/formAnswers.ts";

vi.mock("../../../auth/authConditions.ts", () => ({
  authorizeUserForState: vi.fn(),
}));
const authorizeUserForState = vi.mocked(actualAuthorizeUserForState);

vi.mock("../../../auth/cognito-auth.ts", () => ({
  getCurrentUserInfo: vi.fn(),
}));
const getCurrentUserInfo = vi.mocked(actualGetCurrentUserInfo);

const mockQuery = vi.fn();
const mockUpdate = vi.fn();
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(QueryCommand).callsFake(mockQuery);
mockDynamo.on(UpdateCommand).callsFake(mockUpdate);

const mockFormAnswer1 = {
  state_form: "CO-2025-F1-A",
  question: "mock-Question-Q1",
  rangeId: "0001",
  answer_entry: "CO-2025-F1-A-0001-Q1",
  rows: [{ col1: 12 }],
} as FormAnswer;
const mockFormAnswer2 = {
  state_form: "CO-2025-F1-A",
  question: "mock-Question-Q1",
  rangeId: "0105",
  answer_entry: "CO-2025-F1-A-0105-Q1",
  rows: [{ col1: 23 }],
} as FormAnswer;
const mockFormAnswer3 = {
  state_form: "CO-2025-F1-A",
  question: "mock-Question-Q1",
  rangeId: "0618",
  answer_entry: "CO-2025-F1-A-0618-Q1",
  rows: [{ col1: 34 }],
} as FormAnswer;
const mockStatusData = {
  status_id: FormStatus.InProgress,
  state_comments: [{ type: "text_multiline", entry: "mock state comment" }],
  last_modified: new Date().toISOString(),
} as StateForm;
const mockStateUser = {
  username: "COLO",
  role: "state",
  states: ["CO"],
} as AuthUser;
const mockBusinessUser = {
  username: "BUSY",
  role: "business",
  states: ["CO", "etc"],
} as AuthUser;
const mockStateForm = {
  status_id: FormStatus.InProgress,
  status_modified_by: "PREV",
  status_date: "2025-02-02T19:41:00.770Z",
} as StateForm;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("saveForm.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update form answers and status data", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1, mockFormAnswer2],
        statusData: mockStatusData,
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockStateUser });
    mockQuery.mockResolvedValueOnce({ Items: [mockStateForm], Count: 1 });

    const response = await saveForm(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: undefined,
    }));

    expect(mockUpdate).toHaveBeenCalledTimes(3);
    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: "local-form-answers",
      Key: { answer_entry: "CO-2025-F1-A-0001-Q1" },
      UpdateExpression: "SET #r = :rows, last_modified_by = :last_modified_by, last_modified = :last_modified",
      ExpressionAttributeValues: {
        ":rows": [{ col1: 12 }],
        ":last_modified_by": "COLO",
        ":last_modified": expect.stringMatching(ISO_DATE_REGEX),
      },
      ExpressionAttributeNames: { "#r": "rows" },
      ReturnValues: "ALL_NEW",
    }, expect.any(Function));
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-form-answers",
      Key: { answer_entry: "CO-2025-F1-A-0105-Q1" },
    }), expect.any(Function));

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: "local-state-forms",
      Key: { state_form: "CO-2025-F1-A" },
      UpdateExpression: "SET last_modified_by = :last_modified_by, last_modified = :last_modified, status_modified_by = :status_modified_by, status_date = :status_date, status_id = :status_id, state_comments = :state_comments",
      ExpressionAttributeValues: {
        ":last_modified_by": "COLO",
        ":last_modified": expect.stringMatching(ISO_DATE_REGEX),
        ":status_modified_by": "PREV",
        ":status_date": "2025-02-02T19:41:00.770Z",
        ":status_id": FormStatus.InProgress,
        ":state_comments": [{
          type: "text_multiline",
          entry: "mock state comment"
        }],
      },
      ReturnValues: "ALL_NEW",
    }, expect.any(Function));
  });

  it("should replace null values with 0, anywhere in the answer", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [
          {
            state_form: "CO-2025-F1-A",
            question: "mock-Question-Q1",
            rangeId: "0001",
            rows: [{ foo: { bar: null } }, ],
          }
        ],
        statusData: mockStatusData,
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockStateUser });
    mockQuery.mockResolvedValueOnce({ Items: [mockStateForm], Count: 1 });

    const response = await saveForm(mockEvent);

    expect(response.statusCode).toEqual(200);
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-form-answers",
      ExpressionAttributeValues: expect.objectContaining({
        ":rows": [{ foo: { bar: 0 } }],
      })
    }), expect.any(Function));
  });

  it("should sort answers by answer_entry", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [
          mockFormAnswer2,
          mockFormAnswer3,
          mockFormAnswer1,
        ],
        statusData: mockStatusData,
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockStateUser });
    mockQuery.mockResolvedValueOnce({ Items: [mockStateForm], Count: 1 });

    const response = await saveForm(mockEvent);

    expect(response.statusCode).toEqual(200);
    const savedAnswerEntries = mockUpdate.mock.calls
      .filter(call => call[0].TableName === "local-form-answers")
      .map(call => call[0].Key.answer_entry);
    const expectedAnswerEntries = [
      "CO-2025-F1-A-0001-Q1",
      "CO-2025-F1-A-0105-Q1",
      "CO-2025-F1-A-0618-Q1",
    ];
    expect(savedAnswerEntries).toEqual(expectedAnswerEntries);
  });

  it("should return an error if the form being updated cannot be found", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1],
        statusData: mockStatusData,
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockStateUser });
    mockQuery.mockResolvedValueOnce({ Items: [], Count: 0 });

    const response = await saveForm(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "State Form Not Found" }),
    }));

    // ONE WOULD HOPE that we wouldn't perform any update...
    // But we update form-answers before we check state-forms.
    // TODO: Fix that! And then uncomment this assertion.
    // expect(mockUpdate).toHaveBeenCalledTimes(0);
  });

  it("should update the status tracking fields if status_id changes", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1],
        statusData: {
          ...mockStatusData,
          status_id: FormStatus.FinalCert
        },
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockStateUser });
    mockQuery.mockResolvedValueOnce({ Items: [mockStateForm], Count: 1 });

    const response = await saveForm(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
    }));

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      ExpressionAttributeValues: expect.objectContaining({
        ":status_id": FormStatus.FinalCert,
        ":status_modified_by": "COLO",
        ":status_date": expect.stringMatching(ISO_DATE_REGEX),
      }),
    }), expect.any(Function));
  });

  it("should perform special calculations for section 05", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [
          {
            state_form: "CO-2025-F1-A",
            question: "mock-Question-01",
            rangeId: "0001",
            answer_entry: "CO-2025-F1-A-0001-01",
            rows: [
              {},
              {
                col2: 1,
                col3: 2,
                col4: 3,
                col5: 4,
                col6: 5,
              },
              {
                col2: 6,
                col3: 7,
                col4: 8,
                col5: 9,
                col6: 10,
              },
              {
                col2: 11,
                col3: 12,
                col4: 13,
                col5: 14,
                col6: 15,
              },
            ],
          },
          {
            state_form: "CO-2025-F1-A",
            question: "mock-Question-04",
            rangeId: "0001",
            answer_entry: "CO-2025-F1-A-0001-04",
            rows: [
              {},
              {
                col2: 21,
                col3: 22,
                col4: 23,
                col5: 24,
                col6: 25,
              },
              {
                col2: 26,
                col3: 27,
                col4: 28,
                col5: 29,
                col6: 30,
              },
              {
                col2: 31,
                col3: 32,
                col4: 33,
                col5: 34,
                col6: 35,
              },
            ],
          },
          {
            state_form: "CO-2025-F1-A",
            question: "mock-Question-05",
            rangeId: "0001",
            answer_entry: "CO-2025-F1-A-0001-05",
            rows: [
              {},
              {
                col2: [{ answer: null }],
                col3: [{ answer: null }],
                col4: [{ answer: null }],
                col5: [{ answer: null }],
                col6: [{ answer: null }],
              },
              {
                col2: [{ answer: null }],
                col3: [{ answer: null }],
                col4: [{ answer: null }],
                col5: [{ answer: null }],
                col6: [{ answer: null }],
              },
              {
                col2: [{ answer: null }],
                col3: [{ answer: null }],
                col4: [{ answer: null }],
                col5: [{ answer: null }],
                col6: [{ answer: null }],
              },
            ],
          }
        ],
        statusData: mockStatusData,
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockStateUser });
    mockQuery.mockResolvedValueOnce({ Items: [mockStateForm], Count: 1 });

    const response = await saveForm(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: undefined,
    }));

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-form-answers",
      Key: { answer_entry: "CO-2025-F1-A-0001-05" },
      ExpressionAttributeValues: expect.objectContaining({
        ":rows": [
          {},
          {
            "col2": [{ "answer": "21.0" }],
            "col3": [{ "answer": "11.0" }],
            "col4": [{ "answer": "7.7" }],
            "col5": [{ "answer": "6.0" }],
            "col6": [{ "answer": "5.0" }],
          },
          {
            "col2": [{ "answer": "4.3" }],
            "col3": [{ "answer": "3.9" }],
            "col4": [{ "answer": "3.5" }],
            "col5": [{ "answer": "3.2" }],
            "col6": [{ "answer": "3.0" }],
          },
          {
            "col2": [{ "answer": "2.8" }],
            "col3": [{ "answer": "2.7" }],
            "col4": [{ "answer": "2.5" }],
            "col5": [{ "answer": "2.4" }],
            "col6": [{ "answer": "2.3" }],
          }
        ],
      }),
    }), expect.any(Function));
  });

  it("should ONLY update status data if the requestor is a business user", async () => {
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1, mockFormAnswer2],
        statusData: mockStatusData,
      }),
    };
    getCurrentUserInfo.mockResolvedValueOnce({ status: "success", data: mockBusinessUser });
    mockQuery.mockResolvedValueOnce({ Items: [mockStateForm], Count: 1 });

    const response = await saveForm(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
    }));

    expect(mockUpdate).toHaveBeenCalledTimes(1);

    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      TableName: "local-state-forms",
      ExpressionAttributeValues: expect.objectContaining({
        ":last_modified_by": "BUSY",
      })
    }), expect.any(Function));
  });

  it("should return Internal Server Error if the user is not authorized", async () => {
    authorizeUserForState.mockRejectedValueOnce(new Error("Forbidden"));
    const mockEvent = {
      body: JSON.stringify({
        formAnswers: [mockFormAnswer1],
        statusData: mockStatusData,
      }),
    };

    const response = await saveForm(mockEvent);

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });
});
