import { SSM } from "aws-sdk";
import jwt_decode from "jwt-decode";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export async function getUserDetailsFromEvent(event) {
  await verifyEventSignature(event);
  const apiKey = event?.headers?.["x-api-key"];

  // TODO, it seems that jwt_decode and verifier.verify may return the same object?
  // Maybe we can remove the jwt_decode dependency.

  const token = jwt_decode(apiKey);
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
  console.log(event);
  if (!apiKey) {
    throw new Error("Forbidden");
  }

  const { userPoolId, clientId } = await getCognitoValues();

  const verifier = CognitoJwtVerifier.create({
    tokenUse: "id",
    userPoolId,
    clientId,
  });

  await verifier.verify(apiKey);
}

async function getCognitoValues() {
  let values = loadCognitoValuesFromEnvironment();
  if (!values.userPoolId || !values.clientId) {
    values = await loadCognitoValuesFromAws();
    storeCognitoValuesInEnvironment(values);
  }
  return values;
}

function loadCognitoValuesFromEnvironment() {
  return {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
  };
}

function storeCognitoValuesInEnvironment(values) {
  process.env.COGNITO_USER_POOL_ID = values.userPoolId;
  process.env.COGNITO_USER_POOL_CLIENT_ID = values.clientId;
}

async function loadCognitoValuesFromAws() {
  const ssm = new SSM();
  const stage = process.env.stage;
  const getValue = async (identifier) => {
    const response = await ssm.getParameter({
      Name: `/${stage}/ui-auth/${identifier}`,
    });
    return response?.Parameter?.Value;
  };

  const userPoolId = await getValue("cognito_user_pool_id");
  const clientId = await getValue("cognito_user_pool_client_id");

  if (!userPoolId || !clientId) {
    throw new Error("cannot load cognito values");
  }

  return { userPoolId, clientId };
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
