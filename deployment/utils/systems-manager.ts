import {
  SSMClient,
  GetParameterCommand,
  GetParametersCommand,
} from "@aws-sdk/client-ssm";

// If the param is a SecureString, decrypt it. No effect otherwise.
const WithDecryption = true;
const client = new SSMClient({ region: "us-east-1" });

export async function getParameters(
  parameterNames: string[]
): Promise<{ [name: string]: string }> {
  console.log("Getting SSM parameters:", parameterNames.join(", "));

  const maxBatchSize = 10; // max allowed by AWS
  const batches: string[][] = [];

  for (let i = 0; i < parameterNames.length; i += maxBatchSize) {
    batches.push(parameterNames.slice(i, i + maxBatchSize));
  }

  const result: { [name: string]: string } = {};
  const invalidParameters: string[] = [];

  for (const batch of batches) {
    console.log(`Fetching batch of SSM parameters: ${batch.join(", ")}`);

    const command = new GetParametersCommand({
      Names: batch,
      WithDecryption,
    });

    const data = await client.send(command);
    const parameters = data.Parameters || [];

    for (const param of parameters) {
      if (param.Name && param.Value) {
        result[param.Name] = param.Value;
      }
    }

    if (data.InvalidParameters && data.InvalidParameters.length > 0) {
      invalidParameters.push(...data.InvalidParameters);
    }
  }

  if (invalidParameters.length > 0) {
    for (const invalidParam of invalidParameters) {
      console.info(`No value in SSM for ${invalidParam}`);
    }
  }

  return result;
}

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
  stage: string,
  useDefault: boolean = true
) {
  const stageSpecificKey = `/configuration/${stage}/${parameterName}`;

  try {
    const specificValue = await getParameter(stageSpecificKey);
    if (specificValue) {
      return specificValue;
    }
  } catch (err) {
    console.info(`No value in SSM for ${stageSpecificKey}`);
  }

  if (useDefault) {
    const defaultKey = `/configuration/default/${parameterName}`;
    try {
      const defaultValue = await getParameter(defaultKey);
      if (defaultValue) {
        return defaultValue;
      }
    } catch (err) {
      console.info(`No value in SSM for ${defaultKey}; treating as undefined`);
    }
  }

  return undefined;
}
