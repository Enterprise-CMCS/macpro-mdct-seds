import { getSecret } from "./utils/secrets-manager";

export interface DeploymentConfigProperties {
  project: string;
  stage: string;
  isDev: boolean;
  terminationProtection: boolean;
  bootstrapUsersPasswordArn: string;
  oktaMetadataUrl: string;
  brokerString: string;
  iamPath: string;
  iamPermissionsBoundaryArn: string;
  vpcName: string;
  deploymentConfigParameters: { [name: string]: string | undefined };
}

export const determineDeploymentConfig = async (stage: string) => {
  const project = process.env.PROJECT!;
  const isDev = !["main", "val", "production", "jon-cdk"].includes(stage); // TODO: remove jon-cdk after main is deployed
  const secretConfigOptions = {
    ...(await loadDefaultSecret(project)),
    ...(await loadStageSecret(project, stage)),
  };

  const config = {
    project,
    stage,
    isDev,
    terminationProtection: !isDev,
    ...secretConfigOptions,
  };
  validateConfig(config);

  return config;
};

const loadDefaultSecret = async (project: string) => {
  return JSON.parse((await getSecret(`${project}-default`))!);
};

const loadStageSecret = async (project: string, stage: string) => {
  const secretName = `${project}-${stage}`;
  try {
    return JSON.parse((await getSecret(secretName))!);
  } catch (error: any) {
    console.warn(
      `Optional stage secret "${secretName}" not found: ${error.message}`
    );
    return {};
  }
};

function validateConfig(config: {
  [key: string]: any;
}): asserts config is DeploymentConfigProperties {
  const expectedKeys = [
    "bootstrapUsersPasswordArn",
    "oktaMetadataUrl",
    "brokerString",
    "iamPermissionsBoundaryArn",
    "iamPath",
    "vpcName",
    "stage",
    "project",
  ];

  const invalidKeys = expectedKeys.filter(
    (key) => !config[key] || typeof config[key] !== "string"
  );

  if (invalidKeys.length > 0) {
    throw new Error(
      `The following deployment config keys are missing or invalid: ${invalidKeys}`
    );
  }
}