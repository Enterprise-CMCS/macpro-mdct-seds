import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as generateQuarterForms, scheduled } from "./generateQuarterForms.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";
import { InProgressStatusFields } from "../../../libs/formStatus.js";
import { scanQuestionsByYear } from "../../../storage/formQuestions.js";
import {
  getStatesList,
  findExistingStateForms,
  fetchOrCreateQuestions,
  getAnswersSet,
} from "../../shared/sharedFunctions.js";
import {
  DynamoDBDocumentClient,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

/*
 * Coverage notes:
 *   * The inner function batchWriteAll has retry logic that is untested here,
 *     because that logic is broken. It checked UnprocessedItems.length,
 *     but UnprocessedItems is an object and not an array.
 *     TODO: fix that logic, probably move it to a new file, and test it there.
 *   * The inner function determineAgeRanges has logic that only applies
 *     for years 2018-2020. The current year is 2025, and I don't see
 *     value in unit testing that logic.
 */

vi.mock("../../../libs/time.js", () => ({
  calculateFormQuarterFromDate: vi.fn().mockReturnValue({ year: 2025, quarter: 1 }),
}));

vi.mock("../../../auth/authConditions.js", () => ({
  authorizeAdmin: vi.fn(),
}));

vi.mock("../../shared/sharedFunctions.js", () => ({
  getStatesList: vi.fn(),
  findExistingStateForms: vi.fn(),
  fetchOrCreateQuestions: vi.fn(),
  getAnswersSet: vi.fn(),
}));

vi.mock("../../../storage/formQuestions.js", () => ({
  scanQuestionsByYear: vi.fn(),
}));

const mockBatchWrite = vi.fn().mockResolvedValue({ UnprocessedItems: [] });
const mockDynamo = mockClient(DynamoDBDocumentClient);
mockDynamo.on(BatchWriteCommand).callsFake(mockBatchWrite);

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

const colorado = { state_id: "CO" };
const texas = { state_id: "TX" };
const mockQuestion1 = {
  question: "Q1-21E-42",
  age_ranges: [
    { key: "0001", label: "birth to age 1"},
    { key: "0105", label: "ages 1 to 5" }
  ],
  rows: [],
};
const mockQuestion2 = {
  question: "Q2-GRE-76",
  age_ranges: [
    { key: "0001", label: "birth to age 1"},
    { key: "0105", label: "ages 1 to 5" }
  ],
  rows: [],
};


describe("generateQuarterForms.js", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create state forms for the current quarter", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    const response = await generateQuarterForms({});

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        status: 200,
        message: "Forms successfully created for Quarter 1 of 2025",
      }),
    }));

    expect(mockBatchWrite).toHaveBeenCalled();
    
    const stateFormParams = mockBatchWrite.mock.calls[0][0];
    expect(stateFormParams).toEqual({
      RequestItems: {
        "local-state-forms": expect.any(Array),
      }
    });
    const stateFormPuts = stateFormParams.RequestItems["local-state-forms"];
    expect(stateFormPuts.length).toBe(12);
    for (let put of stateFormPuts) {
      expect(put).toEqual({
        PutRequest: {
          Item: {
            created_by: "seed",
            created_date: expect.stringMatching(ISO_DATE_REGEX),
            form: expect.stringMatching(/^(21E|64\.EC|64\.21E|64\.ECI|GRE|21PW)$/),
            form_id: expect.stringMatching(/^\d$/),
            form_name: expect.any(String),
            last_modified: expect.stringMatching(ISO_DATE_REGEX),
            last_modified_by: "seed",
            program_code: "All",
            quarter: 1,
            state_comments: [
              {
                entry: "",
                type: "text_multiline",
              },
            ],
            state_form: expect.stringMatching(/^(CO|TX)-2025-1-[\.1246CEGIPRW]+$/),
            state_id: expect.stringMatching(/^(CO|TX)$/),
            status_date: expect.stringMatching(ISO_DATE_REGEX),
            ...InProgressStatusFields(),
            status_modified_by: "seed",
            validation_percent: "0.03",
            year: 2025,
          },
        },
      });
    }

    const expectedStateForms = [
      "CO-2025-1-21E",
      "CO-2025-1-64.EC",
      "CO-2025-1-64.21E",
      "CO-2025-1-64.ECI",
      "CO-2025-1-GRE",
      "CO-2025-1-21PW",
      "TX-2025-1-21E",
      "TX-2025-1-64.EC",
      "TX-2025-1-64.21E",
      "TX-2025-1-64.ECI",
      "TX-2025-1-GRE",
      "TX-2025-1-21PW",
    ];
    const actualStateForms = stateFormPuts.map(put => put.PutRequest.Item.state_form);
    expect(actualStateForms).toEqual(expectedStateForms);
  });

  it("should only create missing forms", async () => {
    findExistingStateForms.mockResolvedValueOnce([
      "CO-2025-1-21E",
      "CO-2025-1-64.EC",
      "CO-2025-1-64.21E",
      "CO-2025-1-64.ECI",
      "CO-2025-1-GRE",
      "CO-2025-1-21PW",
      /* Deliberately omitting TX 21E here */
      "TX-2025-1-64.EC",
      "TX-2025-1-64.21E",
      "TX-2025-1-64.ECI",
      "TX-2025-1-GRE",
      "TX-2025-1-21PW",
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({});

    expect(mockBatchWrite).toHaveBeenCalled();
    const stateFormParams = mockBatchWrite.mock.calls[0][0];
    const stateFormPuts = stateFormParams.RequestItems["local-state-forms"];
    expect(stateFormPuts.map(p => p.PutRequest.Item.state_form)).toEqual(["TX-2025-1-21E"]);
  });

  it("should create forms for the specified year and quarter if provided", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({
      // We mocked calculateFormQuarterFromDate to give 2025, but pass 2026 here
      body: JSON.stringify({ year: 2026, quarter: 2 }),
    });

    expect(mockBatchWrite).toHaveBeenCalled();
    const stateFormParams = mockBatchWrite.mock.calls[0][0];
    const actualStateForms = stateFormParams.RequestItems["local-state-forms"]
      .map(put => put.PutRequest.Item.state_form);
    expect(actualStateForms).toHaveLength(12); // [CO, TX] x [6 form types]
    for (let form of actualStateForms) {
      expect(form).toMatch(/^(CO|TX)-2026-/);
    }
  });

  it("should split dynamo requests into batches if there are too many", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    const manyFakeStates = [...new Array(10)].map((_, i) => ({
      stateId: `State${i}`,
    }));
    getStatesList.mockResolvedValueOnce(manyFakeStates);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({});

    expect(mockBatchWrite).toHaveBeenCalled();
    const batchSizes = mockBatchWrite.mock.calls
      .filter(call => !!call[0].RequestItems["local-state-forms"])
      .map(call => call[0].RequestItems["local-state-forms"].length);
    // 10 states x 6 forms = 60 items. Max batch size is 25.
    expect(batchSizes).toEqual([25, 25, 10]);
  });

  it("should return an error if no... states... exist?", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([]);

    const response = await generateQuarterForms({});

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        status: 500,
        message: "Could not retrieve state list.",
      }),
    }));
  });

  it("should populate state answers for newly generated forms", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({ });

    expect(mockBatchWrite).toHaveBeenCalledTimes(2);

    const formAnswerParams = mockBatchWrite.mock.calls[1][0];
    expect(formAnswerParams).toEqual({
      RequestItems: {
        "local-form-answers": expect.any(Array),
      }
    });
    const formAnswerPuts = formAnswerParams.RequestItems["local-form-answers"];
    expect(formAnswerPuts.length).toBe(4);
    for (let put of formAnswerPuts) {
      expect(put).toEqual({
        PutRequest: {
          Item: {
            age_range: expect.stringMatching(/^(birth to age 1|ages 1 to 5)$/),
            answer_entry: expect.stringMatching(/^(CO|TX)-2025-1-21E+-(0001|0105)-42$/),
            created_by: "seed",
            created_date: expect.stringMatching(ISO_DATE_REGEX),
            last_modified: expect.stringMatching(ISO_DATE_REGEX),
            last_modified_by: "seed",
            question: expect.stringMatching(/^2025-21E-42$/),
            rangeId: expect.stringMatching(/^(0001|0105)$/),
            rows: [],
            state_form: expect.stringMatching(/^(CO|TX)-2025-1-21E$/),
          },
        },
      });
    }

    /*
     * getStatesList is mocked to give [CO, TX]
     * scanQuestionsByYear is mocked to give one question with age ranges [0001, 0105]
     * That makes four answer objects to be inserted to the DB.
     */
    const expectedEntries = [
      "CO-2025-1-21E-0001-42",
      "CO-2025-1-21E-0105-42",
      "TX-2025-1-21E-0001-42",
      "TX-2025-1-21E-0105-42"
    ];
    const actualEntries = formAnswerPuts.map(put => put.PutRequest.Item.answer_entry);
    expect(actualEntries).toEqual(expectedEntries);
  });

  it("should populate missing state answers if specified", async () => {
    findExistingStateForms.mockResolvedValueOnce([
      "CO-2025-1-21E",
      "CO-2025-1-64.EC",
      "CO-2025-1-64.21E",
      "CO-2025-1-64.ECI",
      "CO-2025-1-GRE",
      "CO-2025-1-21PW",
      "TX-2025-1-21E",
      "TX-2025-1-64.EC",
      "TX-2025-1-64.21E",
      "TX-2025-1-64.ECI",
      "TX-2025-1-GRE",
      "TX-2025-1-21PW",
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);
    getAnswersSet.mockResolvedValueOnce(new Set());

    await generateQuarterForms({ body: JSON.stringify({ restoreMissingAnswers: true })});

    expect(mockBatchWrite).toHaveBeenCalledTimes(1);

    // We already had all state forms, so the first write was to form answers
    const formAnswerParams = mockBatchWrite.mock.calls[0][0];
    const formAnswerPuts = formAnswerParams.RequestItems["local-form-answers"];
    expect(formAnswerPuts.length).toBe(4);
  });

  it("should not populate missing state answers if not specified", async () => {
    findExistingStateForms.mockResolvedValueOnce([
      "CO-2025-1-21E",
      "CO-2025-1-64.EC",
      "CO-2025-1-64.21E",
      "CO-2025-1-64.ECI",
      "CO-2025-1-GRE",
      "CO-2025-1-21PW",
      "TX-2025-1-21E",
      "TX-2025-1-64.EC",
      "TX-2025-1-64.21E",
      "TX-2025-1-64.ECI",
      "TX-2025-1-GRE",
      "TX-2025-1-21PW",
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    const response = await generateQuarterForms({ });

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        status: 204,
        message: "All forms, for Quarter 1 of 2025, previously existed. No new forms added"
      })
    }));
    expect(mockBatchWrite).toHaveBeenCalledTimes(0);
  });

  it("should populate only the missing state answers if specified", async () => {
    findExistingStateForms.mockResolvedValueOnce([
      "CO-2025-1-21E",
      "CO-2025-1-64.EC",
      "CO-2025-1-64.21E",
      "CO-2025-1-64.ECI",
      "CO-2025-1-GRE",
      "CO-2025-1-21PW",
      "TX-2025-1-21E",
      "TX-2025-1-64.EC",
      "TX-2025-1-64.21E",
      "TX-2025-1-64.ECI",
      "TX-2025-1-GRE",
      "TX-2025-1-21PW",
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);
    getAnswersSet.mockResolvedValueOnce(new Set([
      /* Omitting CO 21E */
      "CO-2025-1-64.EC",
      "CO-2025-1-64.21E",
      "CO-2025-1-64.ECI",
      "CO-2025-1-GRE",
      "CO-2025-1-21PW",
      "TX-2025-1-21E",
      "TX-2025-1-64.EC",
      "TX-2025-1-64.21E",
      "TX-2025-1-64.ECI",
      "TX-2025-1-GRE",
      "TX-2025-1-21PW",
    ]));

    await generateQuarterForms({ body: JSON.stringify({ restoreMissingAnswers: true })});
    
    expect(mockBatchWrite).toHaveBeenCalledTimes(1);

    const formAnswerParams = mockBatchWrite.mock.calls[0][0];
    const formAnswerPuts = formAnswerParams.RequestItems["local-form-answers"];
    expect(formAnswerPuts.length).toBe(2);
    const expectedEntries = [
      /*
       * Since the TX forms were already generated and already had answers,
       * we don't expect to see them here.
       */
      "CO-2025-1-21E-0001-42",
      "CO-2025-1-21E-0105-42",
    ];
    const actualEntries = formAnswerPuts.map(put => put.PutRequest.Item.answer_entry);
    expect(actualEntries).toEqual(expectedEntries);
  });

  it("should query the template table for questions if they are not in the questions table for this year", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([]);
    fetchOrCreateQuestions.mockResolvedValueOnce({
      status: 200,
      payload: [mockQuestion2]
    });

    await generateQuarterForms({ });

    expect(mockBatchWrite).toHaveBeenCalledTimes(2);

    const formAnswerParams = mockBatchWrite.mock.calls[1][0];
    const formAnswerPuts = formAnswerParams.RequestItems["local-form-answers"];
    expect(formAnswerPuts.length).toBe(4);
    for (let put of formAnswerPuts) {
      // The ID of mockQuestion2
      expect(put.PutRequest.Item.question).toBe("2025-GRE-76");
    }
  });

  it("should return an error if fetchOrCreateQuestions fails", async () => {
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([]);
    fetchOrCreateQuestions.mockResolvedValueOnce({
      status: 500,
      message: "That didn't work."
    });

    const response = await generateQuarterForms({ });

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        status: 500,
        message: "That didn't work."
      })
    }));
    expect(mockBatchWrite).toHaveBeenCalledTimes(1);
  });

  it("should return Internal Server Error if the user is not an admin", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));

    const response = await generateQuarterForms({});

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: JSON.stringify({ error: "Forbidden" }),
    }));
  });

  it("should not require authorization if invoked from a scheduled job", async () => {
    authorizeAdmin.mockRejectedValueOnce(new Error("Forbidden"));
    findExistingStateForms.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    const response = await scheduled({});

    expect(response).toEqual(expect.objectContaining({
      statusCode: 200,
      body: JSON.stringify({
        status: 200,
        message: "Forms successfully created for Quarter 1 of 2025"
      }),
    }));

    expect(mockBatchWrite).toHaveBeenCalled();
    // We did not exercise this mock rejection; reset it to a no-op.
    authorizeAdmin.mockReset().mockImplementation();
  });
});
