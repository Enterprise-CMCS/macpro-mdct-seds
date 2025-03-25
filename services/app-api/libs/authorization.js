import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { jwtDecode } from "jwt-decode";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import * as logger from "./debug-lib.js";
import { SimpleJwksCache } from "aws-jwt-verify/jwk";
import { SimpleJsonFetcher } from "aws-jwt-verify/https";

export async function getUserDetailsFromEvent(event) {
  const isLocalStack = event.requestContext.accountId === "000000000000";
  if (!isLocalStack) {
    await verifyEventSignature(event);
  }
  const apiKey = event?.headers?.["x-api-key"];

  // TODO, it seems that jwtDecode and verifier.verify may return the same object?
  // Maybe we can remove the jwtDecode dependency.

  const token = jwtDecode(apiKey);
  const role = mapMembershipToRole(token["custom:ismemberof"]);

  return {
    email: token.email,
    firstName: token.given_name,
    lastName: token.family_name,
    role,
    username: token.identities?.[0]?.userId || token.email,
    usernameSub: token.sub, // whatever that means.
  };
}

export async function verifyEventSignature(event) {
  const apiKey = event?.headers?.["x-api-key"];
  if (!apiKey) {
    console.log("MISSING API KEY, ARE YOU TRYING TO CALL A HANDLER DIRECTLY?");
    throw new Error("Forbidden");
  }

  const userPoolId = process.env.COGNITO_USER_POOL_ID
  const clientId = process.env.COGNITO_USER_POOL_CLIENT_ID

  const verifier = CognitoJwtVerifier.create(
    {
      tokenUse: "id",
      userPoolId,
      clientId,
    },
    {
      jwksCache: new SimpleJwksCache({
        fetcher: new SimpleJsonFetcher({
          defaultRequestOptions: {
            // The default timeout is 1.5s, but we have increased it to 5s after seeing errors
            // such as "Failed to fetch https://[...]/.well-known/jwks.json"
            // due to "write EPIPE" or "socket hang up"
            responseTimeout: 5000,
          },
        }),
      }),
    }
  );

  await verifier.verify(apiKey);
}

function mapMembershipToRole(membership) {
  if (
    membership.includes("CHIP_D_USER_GROUP_ADMIN") ||
    membership.includes("CHIP_V_USER_GROUP_ADMIN") ||
    membership.includes("CHIP_P_USER_GROUP_ADMIN")
  ) {
    return "admin";
  }

  if (
    membership.includes("CHIP_D_USER_GROUP") ||
    membership.includes("CHIP_V_USER_GROUP") ||
    membership.includes("CHIP_P_USER_GROUP")
  ) {
    return "state";
  }

  throw new Error(
    "No assigned CHIP user group found on identity. User probably needs to request a Job Code"
  );
}
