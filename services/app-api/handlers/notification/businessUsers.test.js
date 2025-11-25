import { describe, expect, it, vi } from "vitest";
import { main as notifyBusinessUsers } from "./businessUsers.js";
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

const mockBusinessUser1 = { email: "bizuser1@test.com" };
const mockBusinessUser2 = { email: "bizuser2@test.com" };

const mockFormCO21E = { state_id: "CO", form: "21E" };
const mockFormCOGRE = { state_id: "CO", form: "GRE" };
const mockFormTX21E = { state_id: "TX", form: "21E" };

describe("notification/businessUsers", () => {
  it("should send emails to business users regarding not-yet-certified forms", async () => {
    scanUsersByRole.mockResolvedValueOnce([
      mockBusinessUser1,
      mockBusinessUser2
    ]);
    scanFormsByQuarterAndStatus.mockResolvedValueOnce([
      mockFormCO21E,
      mockFormCOGRE,
      mockFormTX21E,
    ]);

    await notifyBusinessUsers({});

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: "mdct@cms.hhs.gov",
      Destination: {
        ToAddresses: ["bizuser1@test.com", "bizuser2@test.com"],
      },
      Message: {
        Subject: {
          Data: "FFY SEDS Enrollment Data Overdue",
        },
        Body: {
          Text: {
            Data: expect.stringMatching(/have not certified .* for FFY\d{4}/),
          }
        }
      }
    }, expect.any(Function));

    const bodyText = mockSendEmail.mock.calls[0][0].Message.Body.Text.Data;
    expect(bodyText).toContain("CO - 21E, GRE\nTX - 21E");
  });
});
