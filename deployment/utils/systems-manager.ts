import { SSMClient, GetParametersCommand } from "@aws-sdk/client-ssm";

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

export async function getDeploymentConfigParameters(
  parameterNames: { [key: string]: { name: string; useDefault?: boolean } },
  stage: string
) {
  const stageSpecificKeys = Object.entries(parameterNames).map(
    ([, { name }]) => `/configuration/${stage}/${name}`
  );

  const defaultKeys = Object.entries(parameterNames)
    .filter(([, { useDefault }]) => useDefault !== false)
    .map(([, { name }]) => `/configuration/default/${name}`);

  const allKeys = [...stageSpecificKeys, ...defaultKeys];

  const fetchedParameters = await getParameters(allKeys);

  const result: { [key: string]: string | undefined } = {};
  for (const [key, { name, useDefault }] of Object.entries(parameterNames)) {
    const stageSpecificKey = `/configuration/${stage}/${name}`;
    const defaultKey = `/configuration/default/${name}`;

    // Try stage-specific parameter
    let value = fetchedParameters[stageSpecificKey];

    // If not found and useDefault is true, try default parameter
    if (useDefault && value === undefined) {
      value = fetchedParameters[defaultKey];
    }

    result[key] = value;
  }

  return result;
}
