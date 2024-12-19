import { Construct } from "constructs";
import {
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../../deployment-config";
import { createUiComponents } from "./ui";
import { createUiAuthComponents } from "./ui-auth";

export class WithImportsParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    super(scope, id, props);

    const {
      stage,
    } = props;

    createUiComponents({scope: this});
    createUiAuthComponents({
      scope: this,
      stage,
    });
  }
}
