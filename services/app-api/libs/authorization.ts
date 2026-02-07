import { jwtDecode } from "jwt-decode";
import { APIGatewayProxyEvent, CmsUser } from "../shared/types.ts";

export type CmsAmplifyToken = {
  sub: string;
  email: string | undefined;
  given_name: string | undefined;
  family_name: string | undefined;
  "custom:ismemberof": string | undefined;
  identities?: { userId: string | undefined }[];
};

export function getUserDetailsFromEvent(event: APIGatewayProxyEvent): CmsUser {
  const apiKey = event?.headers?.["x-api-key"];
  const token = jwtDecode(apiKey!) as CmsAmplifyToken;
  const role = mapMembershipToRole(token["custom:ismemberof"]!);

  return {
    email: token.email,
    firstName: token.given_name,
    lastName: token.family_name,
    role,
    username: token.identities?.[0]?.userId || token.email,
    usernameSub: token.sub,
  };
}

/**
 * Translate EUA job codes to a probable SEDS user role.
 *
 * SEDS admins can change users' roles, but that won't change their job codes.
 * The AuthUser table in the SEDS DB stores the actual, definite role.
 *
 * Note: that manual process is the only way to get a user with role:"business".
 */
function mapMembershipToRole(membership: string) {
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
