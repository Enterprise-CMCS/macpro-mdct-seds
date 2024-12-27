import { Construct } from "constructs";
import {
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../../deployment-config";
import { createDataComponents } from "./data";

export class WithoutImportsParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    super(scope, id, props);

    const {
      stage,
    } = props;

    createDataComponents(stage);
  }
}
