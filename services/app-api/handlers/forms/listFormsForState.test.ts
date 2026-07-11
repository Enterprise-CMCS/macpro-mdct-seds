import { beforeEach, describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as listFormsForState } from "./listFormsForState.ts";
import {
  scanFormsByState as actualScanFormsByState,
  StateForm,
} from "../../storage/stateForms.ts";
import { StatusCodes } from "../../libs/response-lib.ts";
import { APIGatewayProxyEvent } from "../../shared/types.ts";

vi.mock("../../storage/stateForms.ts", () => ({
  scanFormsByState: vi.fn(),
}));
const scanFormsByState = vi.mocked(actualScanFormsByState);

const mockEvent = {
  pathParameters: {
    state: "CO",
  } as Record<string, string>,
} as APIGatewayProxyEvent;
const mockForm1 = { mockForm: 1 };
const mockForm2 = { mockForm: 2 };
const mockForms = [mockForm1, mockForm2] as unknown as StateForm[];

describe("listFormsForState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should query dynamo for state forms", async () => {
    handler.setupBusinessUser();
    scanFormsByState.mockResolvedValueOnce(mockForms);

    const response = await listFormsForState(mockEvent);

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: StatusCodes.Ok,
        body: JSON.stringify(mockForms),
      })
    );

    expect(scanFormsByState).toHaveBeenCalledWith("CO");
  });

  it("should throw an error if there are no state forms", async () => {
    handler.setupStateUser("CO");
    scanFormsByState.mockResolvedValueOnce([]);

    await expect(listFormsForState(mockEvent)).rejects.toThrow(/No state form/);
  });

  it("should return an error if the user does not have permissions", async () => {
    handler.setupStateUser("TX");

    const response = await listFormsForState(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Forbidden);
  });
});
