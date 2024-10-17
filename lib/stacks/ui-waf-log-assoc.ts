import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface StackProps extends cdk.NestedStackProps {
  stack: string;
}

export class UiWafLogAssocStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage") || "dev";

    console.log("TODO: implement this stack", stage);
  }
}
