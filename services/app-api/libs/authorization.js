import jwt_decode from "jwt-decode";

/**
 *
 * @constructor
 */
function UserCredentials(decoded) {
  if (decoded === undefined) return;
  this.role = decoded["custom:ismemberof"];
  this.state = decoded["custom:state_code"];
  this.identities = decoded.identities;
  this.email = decoded.email;
}

export const getUserCredentialsFromJwt = (event) => {
  console.log("event", event);
  if (!event?.headers || !event.headers?.["x-api-key"])
    return new UserCredentials();
  const decoded = jwt_decode(event.headers["x-api-key"]);
  console.log("decoded", decoded);
  const credentials = UserCredentials(decoded);
  console.log("credentials", credentials);
  return credentials;
};
