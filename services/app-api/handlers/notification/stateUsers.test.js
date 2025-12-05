import { describe, expect, it, vi } from "vitest";
import { main as notifyStateUsers } from "./stateUsers.js";
import { scanUsersByRole } from "../../storage/users.js";
import { scanFormsByQuarterAndStatus } from "../../storage/stateForms.js";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";

vi.mock("../../storage/users.js", () => ({
  scanUsersByRole: vi.fn(),
}));

vi.mock("../../storage/stateForms.js", () => ({
  scanFormsByQuarterAndStatus: vi.fn(),
}));

const mockSes = mockClient(SESClient);
const mockSendEmail = vi.fn();
mockSes.on(SendEmailCommand).callsFake(mockSendEmail);

const mockStateUserCO = { email: "stateuserCO@test.com", states: ["CO"] };
const mockStateUserTX = { email: "stateuserTX@test.com", states: ["TX"] };
const mockStateUserWI = { email: "stateuserWI@test.com", states: ["WI"] };

const mockFormCO21E = { state_id: "CO", form: "21E" };
const mockFormCOGRE = { state_id: "CO", form: "GRE" };
const mockFormTX21E = { state_id: "TX", form: "21E" };

describe("notification/stateUsers", () => {
  it("should send emails to state users regarding not-yet-certified forms", async () => {
    scanUsersByRole.mockResolvedValueOnce([
      mockStateUserCO,
      mockStateUserTX,
      mockStateUserWI
    ]);
    scanFormsByQuarterAndStatus.mockResolvedValueOnce([
      mockFormCO21E,
      mockFormCOGRE,
      mockFormTX21E,
    ]);

    await notifyStateUsers({});

    expect(mockSendEmail).toHaveBeenCalledWith({
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
          }
        }
      }
    }, expect.any(Function));
  });
});
