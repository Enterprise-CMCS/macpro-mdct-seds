import { describe, expect, it, vi } from "vitest";
import { main as notifyBusinessUsers } from "./businessUsers.js";
import {
  getUsersEmailByRole,
  getUncertifiedStatesAndForms,
} from "../shared/sharedFunctions.js";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";

// TODO: remove this mock, once we've moved getQuarter to a different file
vi.mock("./businessUsers.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getQuarter: vi.fn().mockReturnValue(3),
}));

vi.mock("../shared/sharedFunctions.js", () => ({
  getUsersEmailByRole: vi.fn(),
  getUncertifiedStatesAndForms: vi.fn(),
}));

const mockSes = mockClient(SESClient);
const mockSendEmail = vi.fn().mockReturnValue({ MessageId: 123 });
mockSes.on(SendEmailCommand).callsFake(mockSendEmail);

const mockUser1 = { email: "bizuserCO@test.com" };
const mockUser2 = { email: "bizuserTX@test.com" };

describe("notification/businessUsers", () => {
  it("should send emails to business users regarding not-yet-certified forms", async () => {
    getUsersEmailByRole.mockResolvedValueOnce([mockUser1, mockUser2]);
    getUncertifiedStatesAndForms.mockResolvedValueOnce([
      { state: "CO", form: ["21E", "GRE"] },
      { state: "TX", form: ["64.21E"]},
    ]);

    await notifyBusinessUsers({});

    expect(mockSendEmail).toHaveBeenCalledWith({
      Source: "mdct@cms.hhs.gov",
      Destination: {
        ToAddresses: ["bizuserCO@test.com", "bizuserTX@test.com"],
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
    expect(bodyText).toContain("CO - 21E, GRE\nTX - 64.21E");
  });
});
