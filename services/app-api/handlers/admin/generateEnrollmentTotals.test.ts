import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as generateEnrollmentTotals } from "./generateEnrollmentTotals.ts";
import {
  writeAllStateForms as actualWriteAllStateForms,
  scanFormsWithTotals as actualscanFormsWithTotals,
  StateForm,
} from "../../storage/stateForms.ts";
import {
  FormAnswer,
  queryAnswersByEntry as actualQueryAnswersByEntry,
} from "../../storage/formAnswers.ts";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

vi.mock("../../storage/stateForms.ts", () => ({
  scanFormsWithTotals: vi.fn(),
  writeAllStateForms: vi.fn(),
}));
const scanFormsWithTotals = vi.mocked(actualscanFormsWithTotals);
const writeAllStateForms = vi.mocked(actualWriteAllStateForms);

vi.mock("../../storage/formAnswers.ts", () => ({
  queryAnswersByEntry: vi.fn(),
}));
const queryAnswersByEntry = vi.mocked(actualQueryAnswersByEntry);

const mockEvent = {} as APIGatewayProxyEvent;

describe("generateEnrollmentTotals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query answers from dynamo, and write totals back", async () => {
    handler.setupAdminUser();
    scanFormsWithTotals.mockResolvedValueOnce([
      { state_form: "CO-2025-4-21E", form: "21E", year: 2025 },
      { state_form: "CO-2025-4-64.21E", form: "64.21E", year: 2025 },
    ] as StateForm[]);
    let queryCount = 0;
    queryAnswersByEntry.mockImplementation(async () => {
      queryCount += 1;
      return [
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
      ] as FormAnswer[];
    });

    const response = await generateEnrollmentTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(scanFormsWithTotals).toHaveBeenCalled();

    expect(queryAnswersByEntry).toHaveBeenCalledTimes(10);
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
    const actualEntries = queryAnswersByEntry.mock.calls.map((call) => call[0]);
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

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("CO");

    const response = await generateEnrollmentTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
