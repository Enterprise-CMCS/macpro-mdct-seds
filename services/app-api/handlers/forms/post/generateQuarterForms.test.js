import { beforeEach, describe, expect, it, vi } from "vitest";
import { main as generateQuarterForms, scheduled } from "./generateQuarterForms.js";
import { authorizeAdmin } from "../../../auth/authConditions.js";
import { InProgressStatusFields } from "../../../libs/formStatus.js";
import {
  scanForAllFormIds,
  writeAllFormAnswers
} from "../../../storage/formAnswers.js";
import {
  scanQuestionsByYear,
  writeAllFormQuestions,
} from "../../../storage/formQuestions.js";
import {
  getTemplate,
  putTemplate
} from "../../../storage/formTemplates.js";
import {
  scanFormsByQuarter,
  writeAllStateForms
} from "../../../storage/stateForms.js";
import { getStatesList } from "../../shared/sharedFunctions.js";

/*
 * Coverage notes:
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
}));

vi.mock("../../../storage/formAnswers.js", () => ({
  scanForAllFormIds: vi.fn(),
  writeAllFormAnswers: vi.fn(),
}));

vi.mock("../../../storage/formQuestions.js", () => ({
  scanQuestionsByYear: vi.fn(),
  writeAllFormQuestions: vi.fn(),
}));

vi.mock("../../../storage/formTemplates.js", () => ({
  getTemplate: vi.fn(),
  putTemplate: vi.fn(),
}));

vi.mock("../../../storage/stateForms.js", () => ({
  scanFormsByQuarter: vi.fn(),
  writeAllStateForms: vi.fn(),
}));

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
    scanFormsByQuarter.mockResolvedValueOnce([]);
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

    expect(writeAllStateForms).toHaveBeenCalled();
    
    const writtenStateForms = writeAllStateForms.mock.calls[0][0];
    const expectedStateFormIds = [
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
    const actualStateForms = writtenStateForms.map(f => f.state_form);
    expect(actualStateForms).toEqual(expectedStateFormIds);

    for (let form of writtenStateForms) {
      expect(form).toEqual({
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
      });
    }
  });

  it("should only create missing forms", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([
      { state_form: "CO-2025-1-21E" },
      { state_form: "CO-2025-1-64.EC" },
      { state_form: "CO-2025-1-64.21E" },
      { state_form: "CO-2025-1-64.ECI" },
      { state_form: "CO-2025-1-GRE" },
      { state_form: "CO-2025-1-21PW" },
      /* Deliberately omitting TX 21E here */
      { state_form: "TX-2025-1-64.EC" },
      { state_form: "TX-2025-1-64.21E" },
      { state_form: "TX-2025-1-64.ECI" },
      { state_form: "TX-2025-1-GRE" },
      { state_form: "TX-2025-1-21PW" },
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({});

    expect(writeAllStateForms).toHaveBeenCalledWith([
      expect.objectContaining({ state_form: "TX-2025-1-21E" })
    ]);
  });

  it("should create forms for the specified year and quarter if provided", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({
      // We mocked calculateFormQuarterFromDate to give 2025, but pass 2026 here
      body: JSON.stringify({ year: 2026, quarter: 2 }),
    });

    expect(writeAllStateForms).toHaveBeenCalled();
    const writtenStateForms = writeAllStateForms.mock.calls[0][0];
    expect(writtenStateForms).toHaveLength(12); // [CO, TX] x [6 form types]
    for (let form of writtenStateForms) {
      expect(form.state_form).toMatch(/^(CO|TX)-2026-/);
    }
  });

  it("should populate state answers for newly generated forms", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);

    await generateQuarterForms({ });

    expect(writeAllFormAnswers).toHaveBeenCalled();

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
    const writtenFormAnswers = writeAllFormAnswers.mock.calls[0][0];
    const actualEntries = writtenFormAnswers.map(ans => ans.answer_entry);
    expect(actualEntries).toEqual(expectedEntries);
    for (let answer of writtenFormAnswers) {
      expect(answer).toEqual({
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
      });
    }
  });

  it("should populate missing state answers if specified", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([
      { state_form: "CO-2025-1-21E" },
      { state_form: "CO-2025-1-64.EC" },
      { state_form: "CO-2025-1-64.21E" },
      { state_form: "CO-2025-1-64.ECI" },
      { state_form: "CO-2025-1-GRE" },
      { state_form: "CO-2025-1-21PW" },
      { state_form: "TX-2025-1-21E" },
      { state_form: "TX-2025-1-64.EC" },
      { state_form: "TX-2025-1-64.21E" },
      { state_form: "TX-2025-1-64.ECI" },
      { state_form: "TX-2025-1-GRE" },
      { state_form: "TX-2025-1-21PW" },
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);
    scanForAllFormIds.mockResolvedValueOnce([]);

    await generateQuarterForms({ body: JSON.stringify({ restoreMissingAnswers: true })});

    expect(writeAllFormAnswers).toHaveBeenCalled();
    expect(writeAllFormAnswers.mock.calls[0][0]).toHaveLength(4);
  });

  it("should not populate missing state answers if not specified", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([
      { state_form: "CO-2025-1-21E" },
      { state_form: "CO-2025-1-64.EC" },
      { state_form: "CO-2025-1-64.21E" },
      { state_form: "CO-2025-1-64.ECI" },
      { state_form: "CO-2025-1-GRE" },
      { state_form: "CO-2025-1-21PW" },
      { state_form: "TX-2025-1-21E" },
      { state_form: "TX-2025-1-64.EC" },
      { state_form: "TX-2025-1-64.21E" },
      { state_form: "TX-2025-1-64.ECI" },
      { state_form: "TX-2025-1-GRE" },
      { state_form: "TX-2025-1-21PW" },
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
    expect(writeAllStateForms).not.toHaveBeenCalled();
    expect(writeAllFormAnswers).not.toHaveBeenCalled();
  });

  it("should populate only the missing state answers if specified", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([
      { state_form: "CO-2025-1-21E" },
      { state_form: "CO-2025-1-64.EC" },
      { state_form: "CO-2025-1-64.21E" },
      { state_form: "CO-2025-1-64.ECI" },
      { state_form: "CO-2025-1-GRE" },
      { state_form: "CO-2025-1-21PW" },
      { state_form: "TX-2025-1-21E" },
      { state_form: "TX-2025-1-64.EC" },
      { state_form: "TX-2025-1-64.21E" },
      { state_form: "TX-2025-1-64.ECI" },
      { state_form: "TX-2025-1-GRE" },
      { state_form: "TX-2025-1-21PW" },
    ]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([mockQuestion1]);
    scanForAllFormIds.mockResolvedValueOnce([
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
    ]);

    await generateQuarterForms({ body: JSON.stringify({ restoreMissingAnswers: true })});
    
    expect(writeAllFormAnswers).toHaveBeenCalled();
    const expectedEntries = [
      /*
       * Since the TX forms were already generated and already had answers,
       * we don't expect to see them here.
       */
      "CO-2025-1-21E-0001-42",
      "CO-2025-1-21E-0105-42",
    ];
    const actualEntries = writeAllFormAnswers.mock.calls[0][0].map(ans => ans.answer_entry);
    expect(actualEntries).toEqual(expectedEntries);
  });

  it("should query the template table for questions if they are not in the questions table for this year", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([]);
    getTemplate.mockResolvedValueOnce({
      template: [mockQuestion2]
    })

    await generateQuarterForms({ });

    expect(writeAllFormAnswers).toHaveBeenCalled();
    const writtenFormAnswers = writeAllFormAnswers.mock.calls[0][0];
    expect(writtenFormAnswers).toHaveLength(4);
    for (let answer of writtenFormAnswers) {
      // The ID of mockQuestion2
      expect(answer.question).toBe("2025-GRE-76");
    }
  });

  it("should copy the template from the previous year if necessary", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([]);
    getTemplate.mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        year: 2024,
        template: [mockQuestion2]
      });

    await generateQuarterForms({ });

    expect(putTemplate).toHaveBeenCalledWith({
      year: 2025,
      template: [mockQuestion2],
      lastSynced: expect.stringMatching(ISO_DATE_REGEX),
    });
  
    expect(writeAllFormQuestions).toHaveBeenCalledWith([
      {
        ...mockQuestion2,
        created_date: expect.stringMatching(ISO_DATE_REGEX),
        last_modified: expect.stringMatching(ISO_DATE_REGEX),
      },
    ]);

    expect(writeAllFormAnswers).toHaveBeenCalled();
    const writtenFormAnswers = writeAllFormAnswers.mock.calls[0][0];
    expect(writtenFormAnswers).toHaveLength(4);
    for (let answer of writtenFormAnswers) {
      // The ID of mockQuestion2
      expect(answer.question).toBe("2025-GRE-76");
    }
  });

  it("should fail if no template exists for this year or the previous", async () => {
    scanFormsByQuarter.mockResolvedValueOnce([]);
    getStatesList.mockResolvedValueOnce([colorado, texas]);
    scanQuestionsByYear.mockResolvedValueOnce([]);
    getTemplate.mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

    const response = await generateQuarterForms({ });

    expect(response).toEqual(expect.objectContaining({
      statusCode: 500,
      body: expect.stringContaining("No template found for 2025 or 2024!")
    }));
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
    scanFormsByQuarter.mockResolvedValueOnce([]);
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

    expect(writeAllStateForms).toHaveBeenCalled();
    // We did not exercise this mock rejection; reset it to a no-op.
    authorizeAdmin.mockReset().mockImplementation();
  });
});
