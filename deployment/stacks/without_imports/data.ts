import { DynamoDBClient, RestoreTableToPointInTimeCommand } from "@aws-sdk/client-dynamodb";

export function createDataComponents(stage: string) {
  const pitr_able_tables = {
    "form-answers": process.env.FORM_ANSWERS,
    "form-questions": process.env.FORM_QUESTIONS,
    "form-templates": process.env.FORM_TEMPLATES,
    "forms": process.env.FORMS,
    "state-forms": process.env.STATE_FORMS,
    "states": process.env.STATES,
    "auth-user": process.env.AUTH_USER
  }

  const client = new DynamoDBClient();

  for (const [new_name, old_name] of Object.entries(pitr_able_tables)) {
    const command = new RestoreTableToPointInTimeCommand({
      SourceTableName: old_name,
      TargetTableName: `${stage}-${new_name}`,
      UseLatestRestorableTime: true,
    });
    (async () => {
      await client.send(command);
      console.log(`Started restoring ${old_name} as ${stage}-${new_name}`)
    })()
  }
}
