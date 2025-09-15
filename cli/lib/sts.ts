import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { region } from "./consts";

export const checkIfAuthenticated = async (): Promise<void> => {
  const client = new STSClient({ region });
  const command = new GetCallerIdentityCommand({});
  await client.send(command);
};
