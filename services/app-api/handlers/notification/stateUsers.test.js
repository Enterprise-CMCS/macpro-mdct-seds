import { describe, expect, it, vi } from "vitest";
import { main as notifyStateUsers } from "./stateUsers.js";
import {
  getUsersEmailByRole,
  getUncertifiedStates,
} from "../shared/sharedFunctions.js";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";

// TODO: remove this mock, once we've moved getQuarter to a different file
vi.mock("./stateUsers.js", async (importOriginal) => ({
  ...(await importOriginal()),
  getQuarter: vi.fn().mockReturnValue(3),
}));

vi.mock("../shared/sharedFunctions.js", () => ({
  getUsersEmailByRole: vi.fn(),
  getUncertifiedStates: vi.fn(),
}));

const mockSes = mockClient(SESClient);
const mockSendEmail = vi.fn();
mockSes.on(SendEmailCommand).callsFake(mockSendEmail);

const mockStateUser1 = {
  email: "stateuserCO@test.com",
  state: ["CO"],
};
const mockStateUser2 = {
  email: "stateuserTX@test.com",
  state: ["TX"],
};

describe("notification/stateUsers", () => {
  it("should send emails to state users regarding not-yet-certified forms", async () => {
    getUsersEmailByRole.mockResolvedValueOnce([mockStateUser1, mockStateUser2]);
    getUncertifiedStates.mockResolvedValueOnce(["CO", "TX"]);

    await notifyStateUsers({});

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
