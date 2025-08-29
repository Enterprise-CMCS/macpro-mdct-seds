


  return new iam.Role(scope, "CustomResourceRole", {
    assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    inlinePolicies: {
      InlinePolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ["lambda:InvokeFunction"],
            resources: ["*"],
          }),
          new iam.PolicyStatement({
            actions: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents",
            ],
            resources: ["*"],
          }),
          // ...(isDev
          //   ? [
          //       new iam.PolicyStatement({
          //         effect: iam.Effect.DENY,
          //         actions: ["logs:CreateLogGroup"],
          //         resources: ["*"],
    