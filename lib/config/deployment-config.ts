import { getSecret } from "../utils/sm";

interface InjectedConfigOptions {
  project: string;
  stage: string;
  region?: string;
}

type InjectedConfigProperties = {
  bootstrapUsersPasswordArn: string;
  oktaMetadataUrl: string;
  brokerString: string;
  iamPath: string;
  iamPermissionsBoundary: string;
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

  private constructor(config: DeploymentConfigProperties) {
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

    const appConfigInstance = new DeploymentConfig(appConfig);
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
      typeof config.bootstrapUsersPasswordArn === "string" &&
      typeof config.oktaMetadataUrl === "string" &&
      typeof config.brokerString === "string" &&
      typeof config.iamPermissionsBoundary === "string" &&
      typeof config.iamPath === "string" &&
      typeof config.vpcName === "string"
    );
  }
}
