import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// If the param is a SecureString, decrypt it. No effect otherwise.
const WithDecryption = true;
const client = new SSMClient({ region: "us-east-1" });

export async function getParameter(parameterName: string) {
  console.log(
    "getting systems manager parameter store parameter:",
    parameterName
  );
  const command = new GetParameterCommand({
    Name: parameterName,
    WithDecryption,
  });
  try {
    const data = await client.send(command);
    return data.Parameter?.Value;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ParameterNotFound") {
      console.warn(`Parameter ${parameterName} does not exist.`);
      return null;
    }
    throw error;
  }
}
