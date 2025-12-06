import { jwtDecode } from "jwt-decode";

type CmsAmplifyToken = {
  sub: string;
  email: string | undefined;
  given_name: string | undefined;
  family_name: string | undefined;
  "custom:ismemberof": string | undefined;
  identities?: { userId: string | undefined }[];
};

export async function getUserDetailsFromEvent(event) {
  const apiKey = event?.headers?.["x-api-key"];
  const token = jwtDecode(apiKey) as CmsAmplifyToken;
  const role = mapMembershipToRole(token["custom:ismemberof"]);

  return {
    email: token.email,
    firstName: token.given_name,
    lastName: token.family_name,
    role,
    username: token.identities?.[0]?.userId || token.email,
    usernameSub: token.sub,
  };
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
