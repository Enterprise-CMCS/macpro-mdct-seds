export function isLocalStack() {
  return process.env.CDK_DEFAULT_ACCOUNT === "000000000000";
}
