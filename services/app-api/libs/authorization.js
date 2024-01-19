import jwt_decode from "jwt-decode";

/**
 *
 * @constructor
 */
class UserCredentials {
  constructor(decoded) {
    if (decoded === undefined) return;
    this.role = decoded["custom:ismemberof"];
    this.state = decoded["custom:state_code"];
    this.identities = decoded.identities;
    this.email = decoded.email;
  }
}

export const getUserCredentialsFromJwt = (event) => {
  if (!event?.headers || !event.headers?.["x-api-key"])
    return new UserCredentials();
  const decoded = jwt_decode(event.headers["x-api-key"]);
  const credentials = new UserCredentials(decoded);
  return credentials;
};

const loadCognitoValues = async () => {
  if (
    process.env.COGNITO_USER_POOL_ID &&
    process.env.COGNITO_USER_POOL_CLIENT_ID
  ) {
    return {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.COGNITO_USER_POOL_CLIENT_ID,
    };
  } else {
    const ssm = new SSM();
    const stage = process.env.STAGE;
    const userPoolIdParamName = "/" + stage + "/ui-auth/cognito_user_pool_id";
    const userPoolClientIdParamName =
      "/" + stage + "/ui-auth/cognito_user_pool_client_id";
    const userPoolIdParams = {
      Name: userPoolIdParamName,
    };
    const userPoolClientIdParams = {
      Name: userPoolClientIdParamName,
    };
    const userPoolId = await ssm.getParameter(userPoolIdParams).promise();
    const userPoolClientId = await ssm
      .getParameter(userPoolClientIdParams)
      .promise();
    if (userPoolId?.Parameter?.Value && userPoolClientId?.Parameter?.Value) {
      process.env["COGNITO_USER_POOL_ID"] = userPoolId.Parameter.Value;
      process.env["COGNITO_USER_POOL_CLIENT_ID"] =
        userPoolClientId.Parameter.Value;
      return {
        userPoolId: userPoolId.Parameter.Value,
        userPoolClientId: userPoolClientId.Parameter.Value,
      };
    } else {
      throw new Error("cannot load cognito values");
    }
  }
};

export const isAuthorized = async (event) => {
  const cognitoValues = await loadCognitoValues();
  // Verifier that expects valid access tokens:
  const verifier = CognitoJwtVerifier.create({
    userPoolId: cognitoValues.userPoolId,
    tokenUse: "id",
    clientId: cognitoValues.userPoolClientId,
  });

  let isAuthorized;

  if (event?.headers?.["x-api-key"]) {
    try {
      isAuthorized = await verifier.verify(event.headers["x-api-key"]);
    } catch {
      // verification failed - unauthorized
      isAuthorized = false;
    }
  }

  return !!isAuthorized;
};
