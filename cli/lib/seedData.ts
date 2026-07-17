// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { getCloudFormationStackOutputValues } from "./utils.ts";
import { project } from "./consts.ts";
import { invokeLambda } from "./invokeLambda.ts";

export const seedData = async () => {
  const SeedDataFunctionName = (
    await getCloudFormationStackOutputValues(`${project}-floci`)
  )["SeedDataFunctionName"];

  if (SeedDataFunctionName) {
    await invokeLambda(SeedDataFunctionName, "Event");
  }
};
