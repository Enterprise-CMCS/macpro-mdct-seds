import { scanUsersByRole } from "../../storage/users.ts";
import { scanFormsByQuarterAndStatus } from "../../storage/stateForms.ts";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { calculateFiscalQuarterFromDate } from "../../libs/time.ts";
import { FormStatus } from "../../shared/types.ts";

const client = new SESClient({ region: "us-east-1" });

/**
 * Send an email to every business user, listing every state with at least
 * one uncertified form this quarter. This would be invoked once per quarter.
 *
 * Note that this was disabled in Feb 2024. See docs/uncertified_emails.md
 */
export const main = async () => {
  const email = await businessOwnersTemplate();
  const command = new SendEmailCommand(email);
  try {
    const data = await client.send(command);
    console.log(data.MessageId);
  } catch (err) {
    console.error(err, (err as Error).stack);
  }
};

async function businessOwnersTemplate() {
  const { year, quarter } = calculateFiscalQuarterFromDate(new Date());
  const inProgressForms = await scanFormsByQuarterAndStatus(
    year,
    quarter,
    FormStatus.InProgress
  );
  const usersToEmail = (await scanUsersByRole("business")).map((u) => u.email);

  const formsByState = Object_groupBy(inProgressForms, (form) => form.state_id);
  const formattedFormList = Object.entries(formsByState)
    .sort(([stateA, _], [stateB, __]) => stateA.localeCompare(stateB))
    .map(([stateAbbr, forms]) => {
      const formTypes = forms!
        .map((f) => f.form)
        .sort()
        .join(", ");
      return `${stateAbbr} - ${formTypes}`;
    })
    .join("\n");

  const todayDate = new Date().toISOString().split("T")[0];
  const fromEmail = "mdct@cms.hhs.gov";
  const recipient = {
    TO: usersToEmail,
    SUBJECT: "FFY SEDS Enrollment Data Overdue",
    FROM: fromEmail,
    MESSAGE: `
This is an automated message to notify you that the states listed below have not certified their SEDS data for FFY${year} Q${quarter} as of: ${todayDate}

${formattedFormList}

Please follow up with the state’s representatives if you have any questions.

Regards,
MDCT SEDS.
`,
  };

  return {
    Destination: {
      ToAddresses: recipient.TO,
    },
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

/**
 * Ponyfill for `Object.groupBy`, which _should_ be safe in Node 21+.
 *
 * But TS is complaining. Replace me when we're targeting ES2024, please.
 */
function Object_groupBy<TKey extends string | number | symbol, TItem>(
  items: Iterable<TItem>,
  selector: (item: TItem) => TKey
) {
  const groups: Partial<Record<TKey, TItem[]>> = {};
  for (let item of items) {
    const key = selector(item);
    if (key in groups) {
      groups[key]!.push(item);
    } else {
      groups[key] = [item];
    }
  }
  return groups;
}
