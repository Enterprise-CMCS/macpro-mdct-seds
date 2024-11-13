import {
  SSMClient,
  GetParameterCommand,
} from "@aws-sdk/client-ssm";

// If the param is a SecureString, decrypt it. No effect otherwise.
const WithDecryption = true;
const client = new SSMClient({ region: "us-east-1" });

export async function getParameter(parameterName: string) {
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption,
  });
  const data = await client.send(command);
  return data.Parameter?.Value;
}
