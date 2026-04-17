#!/usr/bin/env node
// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
// .github/setBranchName.ts dependabot/npm_and_yarn/some-package-1.2.3
import { createHash } from "node:crypto";

export const setBranchName = (githubRefName: string) => {
  console.log(`Setting branch name for ${githubRefName}`);
  if (githubRefName.startsWith("dependabot/")) {
    const hash = createHash("sha256").update(githubRefName).digest("hex");
    console.log(`result: ${"x" + hash.substring(0, 10)}`);
    return "x" + hash.substring(0, 10);
  } else if (githubRefName.startsWith("snyk-")) {
    const parts = githubRefName.split("-");
    const lastPart = parts.at(-1);
    console.log(`result: ${"s" + lastPart.substring(0, 10)}`);
    return "s" + lastPart.substring(0, 10);
  } else {
    console.log(`result: ${githubRefName}`);
    return githubRefName;
  }
};

if (process.argv[2]) {
  const name = setBranchName(process.argv[2]);
  console.log(name);
}
