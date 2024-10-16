import {
  CloudFormationClient,
  ListExportsCommand,
} from "@aws-sdk/client-cloudformation";

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  DescribeSecretCommand,
} from "@aws-sdk/client-secrets-manager";

export async function getSecret(
  secretId: string,
  region: string = "us-east-1"
): Promise<string> {
  const client = new SecretsManagerClient({ region });
  try {
    // Check if the secret is marked for deletion
    const describeCommand = new DescribeSecretCommand({ SecretId: secretId });

    const secretMetadata = await client.send(describeCommand);
    if (secretMetadata.DeletedDate) {
      throw new Error(
        `Secret ${secretId} is marked for deletion and will not be used.`
      );
    }

    const command = new GetSecretValueCommand({ SecretId: secretId });
    const data = await client.send(command);
    if (!data.SecretString) {
      throw `Secret ${secretId} has no SecretString field present in response`;
    }
    return data.SecretString;
  } catch (error: unknown) {
    throw new Error(`Failed to fetch secret ${secretId}: ${error}`);
  }
}

export async function getExport(
  exportName: string,
  region: string = "us-east-1"
): Promise<string> {
  const client = new CloudFormationClient({ region });
  const command = new ListExportsCommand({});

  try {
    const response = await client.send(command);
    const exports = response.Exports || [];
    const exportItem = exports.find((exp) => exp.Name === exportName);
    if (!exportItem) {
      throw new Error(`Export with name ${exportName} does not exist.`);
    }
    return exportItem.Value!;
  } catch (error) {
    console.error(`Error getting export value: ${error}`);
    throw error;
  }
}

export interface InjectedConfigOptions {
  project: string;
  stage: string;
  region?: string;
}

export type InjectedConfigProperties = {
  brokerString: string;
  dbInfoSecretName: string;
  devPasswordArn: string;
  domainCertificateArn: string;
  domainName: string;
  emailAddressLookupSecretName: string;
  googleAnalyticsDisable: boolean;
  googleAnalyticsGTag: string;
  iamPath: string;
  iamPermissionsBoundary: string;
  idmAuthzApiEndpoint: string;
  idmAuthzApiKeyArn: string;
  idmClientId: string;
  idmClientIssuer: string;
  idmClientSecretArn: string;
  idmEnable: boolean;
  idmHomeUrl: string;
  legacyS3AccessRoleArn: string;
  useSharedOpenSearch: boolean;
  vpcName: string;
};

export type DeploymentConfigProperties = InjectedConfigProperties & {
  isDev: boolean;
  project: string;
  sharedOpenSearchDomainArn: string;
  sharedOpenSearchDomainEndpoint: string;
  stage: string;
  terminationProtection: boolean;
};

export class DeploymentConfig {
  public config: DeploymentConfigProperties;

  private constructor(
    options: InjectedConfigOptions,
    config: DeploymentConfigProperties
  ) {
    console.log("TODO: This is temporary options:", options);
    this.config = config;
  }

  public static async fetch(
    options: InjectedConfigOptions
  ): Promise<DeploymentConfig> {
    const injectedConfig = await DeploymentConfig.loadConfig(options);
    const appConfig: DeploymentConfigProperties = {
      ...injectedConfig,
      project: options.project,
      stage: options.stage,
      isDev: !["main", "val", "production"].includes(options.stage),
      terminationProtection: ["main", "val", "production"].includes(
        options.stage
      ),
      sharedOpenSearchDomainArn: "",
      sharedOpenSearchDomainEndpoint: "",
    };

    const appConfigInstance = new DeploymentConfig(options, appConfig);
    await appConfigInstance.initialize();
    return appConfigInstance;
  }

  private static async loadConfig(
    options: InjectedConfigOptions
  ): Promise<InjectedConfigProperties> {
    const { project, stage } = options;
    const defaultSecretName = `${project}-default`;
    const stageSecretName = `${project}-${stage}`;

    // Fetch project-default secret
    let defaultSecret: { [key: string]: string } = {};
    try {
      defaultSecret = JSON.parse(await getSecret(defaultSecretName));
    } catch {
      throw new Error(`Failed to fetch mandatory secret ${defaultSecretName}`);
    }

    // Fetch project-stage secret if it exists and is not marked for deletion
    let stageSecret: { [key: string]: string } = {};
    try {
      stageSecret = JSON.parse(await getSecret(stageSecretName));
    } catch (error: any) {
      console.warn(
        `Optional stage secret ${stageSecretName} not found: ${error.message}`
      );
    }

    // Merge secrets with stageSecret taking precedence
    const combinedSecret: { [key: string]: any } = {
      ...defaultSecret,
      ...stageSecret,
    };

    // Convert "true"/"false" strings to booleans
    Object.keys(combinedSecret).forEach((key) => {
      if (combinedSecret[key] === "true") {
        combinedSecret[key] = true;
      } else if (combinedSecret[key] === "false") {
        combinedSecret[key] = false;
      }
    });

    if (!this.isConfig(combinedSecret)) {
      throw new Error(
        `The resolved configuration for stage ${stage} has missing or malformed values.`
      );
    }

    return combinedSecret as InjectedConfigProperties;
  }

  private static isConfig(config: any): config is InjectedConfigProperties {
    return (
      typeof config.brokerString === "string" &&
      typeof config.dbInfoSecretName == "string" && // pragma: allowlist secret
      typeof config.devPasswordArn == "string" && // pragma: allowlist secret
      typeof config.domainCertificateArn == "string" &&
      typeof config.domainName === "string" &&
      typeof config.emailAddressLookupSecretName === "string" && // pragma: allowlist secret
      typeof config.googleAnalyticsDisable == "boolean" &&
      typeof config.googleAnalyticsGTag === "string" &&
      typeof config.iamPermissionsBoundary === "string" &&
      typeof config.iamPath === "string" &&
      typeof config.idmAuthzApiEndpoint === "string" &&
      typeof config.idmAuthzApiKeyArn === "string" && // pragma: allowlist secret
      typeof config.idmClientId === "string" &&
      typeof config.idmClientIssuer === "string" &&
      typeof config.idmClientSecretArn === "string" && // pragma: allowlist secret
      typeof config.idmEnable === "boolean" &&
      typeof config.idmHomeUrl === "string" &&
      typeof config.legacyS3AccessRoleArn === "string" &&
      typeof config.useSharedOpenSearch === "boolean" &&
      typeof config.vpcName === "string"
    );
  }

  private async initialize(): Promise<void> {
    if (this.config.useSharedOpenSearch) {
      this.config.sharedOpenSearchDomainArn = await getExport(
        `${this.config.project}-sharedOpenSearchDomainArn`
      );
      this.config.sharedOpenSearchDomainEndpoint = await getExport(
        `${this.config.project}-sharedOpenSearchDomainEndpoint`
      );
    }
  }
}
