import { scanUsersByRole } from "../../storage/users.ts";
import { scanFormsByQuarterAndStatus } from "../../storage/stateForms.ts";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { calculateFiscalQuarterFromDate } from "../../libs/time.ts";
import { FormStatus } from "../../shared/types.ts";

const client = new SESClient({ region: "us-east-1" });

/**
 * Send an email to every state user, for every state with at least
 * one uncertified form this quarter. This would be invoked once per quarter.
 *
 * Note that this was disabled in Feb 2024. See docs/uncertified_emails.md
 */
export const main = async () => {
  const email = await stateUsersTemplate();
  console.log("emailTemplate: ", email);
  const command = new SendEmailCommand(email);
  try {
    const data = await client.send(command);
    console.log(data.MessageId);
  } catch (err) {
    console.error(err, (err as Error).stack);
  }
};

/**
 * List all emails of users whose state has an In Progress form this quarter.
 */
async function determineUsersToEmail(
  year: number,
  quarter: number
): Promise<string[]> {
  const inProgressForms = await scanFormsByQuarterAndStatus(
    year,
    quarter,
    FormStatus.InProgress
  );
  const statesToEmail = new Set(inProgressForms.map((f) => f.state_id));
  const users = await scanUsersByRole("state");
  return users.filter((u) => statesToEmail.has(u.state!)).map((u) => u.email);
}

// creates a template for stateUsers
async function stateUsersTemplate() {
  const { year, quarter } = calculateFiscalQuarterFromDate(new Date());
  const stateUsersToEmail = await determineUsersToEmail(year, quarter);
  const fromEmail = "mdct@cms.hhs.gov";
  let todayDate = new Date().toISOString().split("T")[0];

  const recipient = {
    TO: stateUsersToEmail,
    SUBJECT: `Reminder: SEDS FFY${year} Q${quarter} Enrollment Data Overdue`,
    FROM: fromEmail,
    MESSAGE: `
    Hello State user,

    We are reaching out to check on the status of your state's FFY${year} Q${quarter} enrollment data
    submission in the Statistical Enrollment Data System (SEDS).

    FFY${year} Q${quarter} reporting of enrollment data to SEDS was due on ${todayDate}. Our records
    indicate that your state has not yet submitted the required enrollment data to SEDS at this time.

    If your state has any other outstanding quarter(s) of data, please submit that information along
    with your FFY${year} Q${quarter} data.

    If your state allows retroactive eligibility, you may certify the FFY${year} Q${quarter} enrollment
    reports as preliminary in the system. When you have the final enrollment data, you may update and
    certify the final reports thirty (30) days after the end of the next quarter (with next quarter's
    preliminary report). The final reports should include information about children whose eligibility
    was retroactive to the earlier quarter.

    If you have any questions, please send an email to: MDCT_Help@cms.hhs.gov

    CMS SEDS TEAM

    `,
  };
  return {
    Destination: { ToAddresses: recipient.TO },
    Message: {
      Body: {
        Text: {
          Data: recipient.MESSAGE,
        },
      },
      Subject: {
        Data: recipient.SUBJECT,
      },
    },
    Source: recipient.FROM,
  };
}
