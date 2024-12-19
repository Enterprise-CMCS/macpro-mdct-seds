import { Construct } from "constructs";
<<<<<<< HEAD
import { Stack, StackProps } from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../../deployment-config";
import { createUiComponents } from "./ui";
import { createUiAuthComponents } from "./ui-auth";
import { createDataComponents } from "./data";
=======
import {
  Stack,
  StackProps,
} from "aws-cdk-lib";
import { DeploymentConfigProperties } from "../../deployment-config";
import { createUiComponents } from "./ui";
import { createUiAuthComponents } from "./ui-auth";
>>>>>>> 85799ee9f7516979d902b4574fbc59699700cb92

export class WithImportsParentStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & DeploymentConfigProperties
  ) {
    super(scope, id, props);

<<<<<<< HEAD
    const { stage, oktaMetadataUrl } = props;

    createUiComponents({ scope: this });
=======
    const {
      stage,
    } = props;

    createUiComponents({scope: this});
>>>>>>> 85799ee9f7516979d902b4574fbc59699700cb92

    createUiAuthComponents({
      scope: this,
      stage,
<<<<<<< HEAD
      oktaMetadataUrl,
    });

    createDataComponents({ scope: this, stage });
=======
    });
>>>>>>> 85799ee9f7516979d902b4574fbc59699700cb92
  }
}
