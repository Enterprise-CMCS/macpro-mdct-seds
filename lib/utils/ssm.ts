import {
  SSMClient,
  GetParameterCommand,
  DescribeParametersCommand,
} from "@aws-sdk/client-ssm";

export async function getParameter(
  parameterName: string,
  region: string = "us-east-1",
  withDecryption: boolean = true
): Promise<string> {
  const client = new SSMClient({ region });

  try {
    // Check if the parameter exists by describing it
    const describeCommand = new DescribeParametersCommand({
      ParameterFilters: [
        {
          Key: "Name",
          Values: [parameterName],
        },
      ],
    });

    const parameterMetadata = await client.send(describeCommand);
    if (
      !parameterMetadata.Parameters ||
      parameterMetadata.Parameters.length === 0
    ) {
      throw new Error(`Parameter ${parameterName} does not exist.`);
    }

    // Fetch the parameter value
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: withDecryption,
    });

    const data = await client.send(command);
    if (!data.Parameter || !data.Parameter.Value) {
      throw new Error(
        `Parameter ${parameterName} has no value present in response`
      );
    }

    return data.Parameter.Value;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch parameter ${parameterName}: ${error}`);
  }
}
