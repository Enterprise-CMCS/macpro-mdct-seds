import { describe, expect, it, vi } from "vitest";
import "../../libs/handler-mocking.ts";
import { main as notifyStateUsers } from "./stateUsers.ts";
import {
  scanUsersByRole as actualScanUsersByRole,
  AuthUser,
} from "../../storage/users.ts";
import {
  scanFormsByQuarterAndStatus as actualScanForms,
  StateForm,
} from "../../storage/stateForms.ts";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { StatusCodes } from "../../libs/response-lib.ts";

vi.mock("../../storage/users.ts", () => ({
  scanUsersByRole: vi.fn(),
}));
const scanUsersByRole = vi.mocked(actualScanUsersByRole);

vi.mock("../../storage/stateForms.ts", () => ({
  scanFormsByQuarterAndStatus: vi.fn(),
}));
const scanFormsByQuarterAndStatus = vi.mocked(actualScanForms);

const mockSes = mockClient(SESClient);
const mockSendEmail = vi.fn().mockResolvedValue({ MessageId: 123 });
mockSes.on(SendEmailCommand).callsFake(mockSendEmail);

const mockStateUserCO = {
  email: "stateuserCO@test.com",
  state: "CO",
} as AuthUser;
const mockStateUserTX = {
  email: "stateuserTX@test.com",
  state: "TX",
} as AuthUser;
const mockStateUserWI = {
  email: "stateuserWI@test.com",
  state: "WI",
} as AuthUser;

const mockFormCO21E = { state_id: "CO", form: "21E" } as StateForm;
const mockFormCOGRE = { state_id: "CO", form: "GRE" } as StateForm;
const mockFormTX21E = { state_id: "TX", form: "21E" } as StateForm;

describe("notification/stateUsers", () => {
  it("should send emails to state users regarding not-yet-certified forms", async () => {
    scanUsersByRole.mockResolvedValueOnce([
      mockStateUserCO,
      mockStateUserTX,
      mockStateUserWI,
    ]);
    scanFormsByQuarterAndStatus.mockResolvedValueOnce([
      mockFormCO21E,
      mockFormCOGRE,
      mockFormTX21E,
    ]);

    await notifyStateUsers();

    expect(mockSendEmail).toHaveBeenCalledWith(
      {
        Source: "mdct@cms.hhs.gov",
        Destination: {
          ToAddresses: ["stateuserCO@test.com", "stateuserTX@test.com"],
        },
        Message: {
          Subject: {
            Data: expect.stringMatching(/FFY\d{4} Q\d Enrollment Data Overdue/),
          },
          Body: {
            Text: {
              Data: expect.stringContaining("your state has not yet submitted"),
            },
          },
        },
      },
      expect.any(Function)
    );
  });
});
