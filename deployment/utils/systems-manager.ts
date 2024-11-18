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
  const data = await client.send(command);
  return data.Parameter?.Value;
}

export async function getDeploymentConfigParameter(
  parameterName: string,
  stage: string
) {
  const stageSpecificKey = `/configuration/${stage}/${parameterName}`;
  const defaultKey = `/configuration/default/${parameterName}`;

  try {
    const specificValue = await getParameter(stageSpecificKey);
    if (specificValue) {
      return specificValue;
    }
  } catch (err) {
    console.info(`No value in SSM for ${stageSpecificKey}; using default`);
  }

  try {
    const defaultValue = await getParameter(defaultKey);
    if (defaultValue) {
      return defaultValue;
    }
  } catch (err) {
    console.info(`No value in SSM for ${defaultKey}; treating as undefined`);
  }

  return undefined;
}
