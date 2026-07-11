import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as getForm } from "./getForm.ts";
import {
  getStateForm as actualGetStateForm,
  StateForm,
} from "../../storage/stateForms.ts";
import {
  queryAnswersByForm as actualQueryAnswersByForm,
  FormAnswer,
} from "../../storage/formAnswers.ts";
import {
  scanQuestionsByYearAndForm as actualScanQuestionsByYearAndForm,
  FormQuestion,
} from "../../storage/formQuestions.ts";
import { APIGatewayProxyEvent, FormStatus } from "../../shared/types.ts";
import { StatusCodes } from "../../libs/response-lib.ts";

vi.mock("../../storage/stateForms.ts", () => ({
  getStateForm: vi.fn(),
}));
const getStateForm = vi.mocked(actualGetStateForm);
vi.mock("../../storage/formAnswers.ts", () => ({
  queryAnswersByForm: vi.fn(),
}));
const queryAnswersByForm = vi.mocked(actualQueryAnswersByForm);
vi.mock("../../storage/formQuestions.ts", () => ({
  scanQuestionsByYearAndForm: vi.fn(),
}));
const scanQuestionsByYearAndForm = vi.mocked(actualScanQuestionsByYearAndForm);

const mockStateForm = {
  state_form: "CO-2025-21E-A",
  status_id: FormStatus.InProgress,
} as StateForm;
const mockFormAnswer = {
  state_form: "CO-2025-21E-A",
  question: "mock-Question-Q1",
  rangeId: "0001",
  answer_entry: "CO-2025-21E-A-0001-Q1",
  rows: [{ col1: "mock" }],
} as FormAnswer;
const mockFormQuestion = {
  question: "2025-21E-05",
} as FormQuestion;
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
    getStateForm.mockResolvedValueOnce(mockStateForm);
    queryAnswersByForm.mockResolvedValueOnce([mockFormAnswer]);
    scanQuestionsByYearAndForm.mockResolvedValueOnce([mockFormQuestion]);

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

    expect(getStateForm).toHaveBeenCalledWith("CO-2025-1-21E");
    expect(queryAnswersByForm).toHaveBeenCalledWith("CO-2025-1-21E");
    expect(scanQuestionsByYearAndForm).toHaveBeenCalledWith(2025, "21E");
  });

  it("should continue even if no answers can be found", async () => {
    handler.setupBusinessUser();
    getStateForm.mockResolvedValueOnce(mockStateForm);
    queryAnswersByForm.mockResolvedValueOnce([]);
    scanQuestionsByYearAndForm.mockResolvedValueOnce([mockFormQuestion]);

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
    getStateForm.mockResolvedValueOnce(mockStateForm);
    queryAnswersByForm.mockResolvedValueOnce([mockFormAnswer]);
    scanQuestionsByYearAndForm.mockResolvedValueOnce([]);

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
    getStateForm.mockResolvedValueOnce(undefined);
    queryAnswersByForm.mockResolvedValueOnce([mockFormAnswer]);
    scanQuestionsByYearAndForm.mockResolvedValueOnce([mockFormQuestion]);

    const response = await getForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.NotFound);
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("TX");

    const response = await getForm(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
