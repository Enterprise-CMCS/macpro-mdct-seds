// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import { invokeLambda } from "./invokeLambda.ts";

export const bootstrapLocalCognitoUsers = async () => {
  await invokeLambda("ui-auth-floci-bootstrapUsers", "RequestResponse");
};
