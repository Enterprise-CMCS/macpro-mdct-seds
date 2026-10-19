import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as listFormsForQuarter } from "./listFormsForQuarter.ts";
import {
  scanFormsByStateAndQuarter as actualScanFormsByStateAndQuarter,
  StateForm,
} from "../../storage/stateForms.ts";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

vi.mock("../../storage/stateForms.ts", () => ({
  scanFormsByStateAndQuarter: vi.fn(),
}));
const scanFormsByStateAndQuarter = vi.mocked(actualScanFormsByStateAndQuarter);

const mockEvent = {
  pathParameters: {
    state: "CO",
    year: "2025",
    quarter: "1",
  } as Record<string, string>,
} as APIGatewayProxyEvent;
const mockForms = [{ mockForm: 1 }, { mockForm: 2 }] as unknown as StateForm[];

describe("listFormsForQuarter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
    handler.setupStateUser("CO");
    scanFormsByStateAndQuarter.mockResolvedValueOnce(mockForms);

    const response = await listFormsForQuarter(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockForms),
      })
    );
    expect(scanFormsByStateAndQuarter).toHaveBeenCalledWith("CO", 2025, 1);
  });

  it.each([
    {
      reason: "bad state",
      params: { state: "zzz", year: "2026", quarter: "1" },
    },
    {
      reason: "bad year",
      params: { state: "CO", year: "zzz", quarter: "1" },
    },
    {
      reason: "bad quarter",
      params: { state: "CO", year: "2026", quarter: "zzz" },
    },
  ])(
    "should return an error for bad parameters ($reason)",
    async ({ params }) => {
      handler.setupAdminUser();
      const response = await listFormsForQuarter({
        ...mockEvent,
        pathParameters: params,
      });
      expect(response.statusCode).toBe(StatusCodes.BadRequest);
    }
  );

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("TX");

    const response = await listFormsForQuarter(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
