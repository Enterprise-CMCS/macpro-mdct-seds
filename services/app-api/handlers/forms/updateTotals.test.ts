import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as updateTotals } from "./updateTotals.ts";
import {
  getStateForm as actualGetStateForm,
  updateEnrollmentCounts as actualUpdateEnrollmentCounts,
  StateForm,
} from "../../storage/stateForms.ts";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

vi.mock("../../storage/stateForms.ts", () => ({
  getStateForm: vi.fn(),
  updateEnrollmentCounts: vi.fn(),
}));
const getStateForm = vi.mocked(actualGetStateForm);
const updateEnrollmentCounts = vi.mocked(actualUpdateEnrollmentCounts);

const mockParams: Record<string, string> = {
  state: "CO",
  year: "2025",
  quarter: "1",
  form: "21E",
} as Record<string, string>;

const mockEvent = {
  body: JSON.stringify({
    state: "CO",
    year: 2025,
    quarter: 1,
    form: "21E",
    totalEnrollment: 42,
  }),
  pathParameters: mockParams,
} as APIGatewayProxyEvent;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

describe("updateTotals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add an enrollmentCounts property to existing state forms", async () => {
    handler.setupStateUser("CO");
    getStateForm.mockResolvedValueOnce({ form: "21E" } as StateForm);

    const response = await updateTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(getStateForm).toHaveBeenCalledWith("CO-2025-1-21E");
    expect(updateEnrollmentCounts).toHaveBeenCalledWith({
      state_form: "CO-2025-1-21E",
      last_modified: expect.stringMatching(ISO_DATE_REGEX),
      last_modified_by: "TEST",
      enrollmentCounts: {
        year: 2025,
        type: "separate",
        count: 42,
      },
    });
  });

  it("should use the appropriate enrollmentCounts type for the specified form", async () => {
    handler.setupStateUser("CO");
    handler.setupStateUser("CO");
    getStateForm.mockResolvedValueOnce({
      form: "64.21E",
      enrollmentCounts: { foo: "bar" }, // <- this will be overwritten
    } as unknown as StateForm);

    const response = await updateTotals({
      ...mockEvent,
      pathParameters: { ...mockParams, form: "64.21E" },
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(getStateForm).toHaveBeenCalledWith("CO-2025-1-64.21E");
    expect(updateEnrollmentCounts).toHaveBeenCalledWith(
      expect.objectContaining({
        enrollmentCounts: expect.objectContaining({
          type: "expansion",
        }),
      })
    );
  });

  it("should not update forms which do not have enrollment totals", async () => {
    handler.setupStateUser("CO");

    const response = await updateTotals({
      ...mockEvent,
      pathParameters: { ...mockParams, form: "GRE" },
    });

    expect(response.statusCode).toBe(StatusCodes.Ok);
    expect(updateEnrollmentCounts).not.toHaveBeenCalled();
  });

  it.each([
    { reason: "no body", body: null },
    { reason: "no enrollment", body: {} },
    { reason: "invalid enrollment", body: { totalEnrollment: "zzz" } },
  ])(
    "should return an error if the body is invalid ($reason)",
    async ({ body }) => {
      handler.setupStateUser("CO");

      const response = await updateTotals({
        ...mockEvent,
        body: JSON.stringify(body),
      });

      expect(response.statusCode).toBe(StatusCodes.BadRequest);
    }
  );

  it("should return an error if the requested form does not exist", async () => {
    handler.setupStateUser("CO");
    getStateForm.mockResolvedValueOnce(undefined);

    const response = await updateTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.NotFound);
    expect(updateEnrollmentCounts).not.toHaveBeenCalled();
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupBusinessUser();

    const response = await updateTotals(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
