import { describe, expect, it, vi } from "vitest";
import * as handler from "../../libs/handler-mocking.ts";
import { main as notifyUncertified } from "./uncertified.ts";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "../../shared/types.ts";
import { StatusCodes } from "../../libs/response-lib.ts";

const mockDynamo = mockClient(DynamoDBDocumentClient);
const mockScan = vi.fn();
mockDynamo.on(ScanCommand).callsFake(mockScan);

const mockSes = mockClient(SESClient);
const mockSendEmail = vi.fn().mockResolvedValue({ MessageId: 123 });
mockSes.on(SendEmailCommand).callsFake(mockSendEmail);

const mockUser1 = { email: "bizuser1@test.com" };
const mockUser2 = { email: "bizuser2@test.com" };

describe("notification/uncertified", () => {
  it("should send emails to business users regarding just-uncertified forms", async () => {
    handler.setupStateUser("CO");
    mockScan.mockResolvedValueOnce({ Count: 2, Items: [mockUser1, mockUser2] });
    const mockEvent = {
      body: JSON.stringify({
        formInfo: {
          state_id: "CO",
          form: "21E",
          year: "2025",
          quarter: "1",
        },
      }),
    } as APIGatewayProxyEvent;

    const response = await notifyUncertified(mockEvent);

    expect(response.statusCode).toBe(StatusCodes.Ok);

    expect(mockSendEmail).toHaveBeenCalledWith(
      {
        Source: "mdct@cms.hhs.gov",
        Destination: {
          ToAddresses: ["bizuser1@test.com", "bizuser2@test.com"],
        },
        Message: {
          Subject: {
            Data: expect.stringMatching(/Notice \- CO \- \d{4}\-\d\d\-\d\d/),
          },
          Body: {
            Text: {
              Data: expect.stringMatching(/has uncertified the following/),
            },
          },
        },
      },
      expect.any(Function)
    );

    const bodyText = mockSendEmail.mock.calls[0][0].Message.Body.Text.Data;
    expect(bodyText).toContain("Form 21E for FFY 2025 Quarter 1");
  });
});
