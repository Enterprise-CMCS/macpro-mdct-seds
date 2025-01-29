import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

const COGNITO_CLIENT = new CognitoIdentityProviderClient({
  apiVersion: "2016-04-19",
  region: "us-east-1",
});

export async function createUser(params) {
  await new Promise((resolve, _reject) => {
    try {
      COGNITO_CLIENT.send(new AdminCreateUserCommand(params));
      resolve({ statusCode: 200, body: { message: "SUCCESS" } });
    } catch (err) {
      console.log("FAILED ", err, err.stack); // eslint-disable-line no-console
      resolve({ statusCode: 500, body: { message: "FAILED", error: err } }); //if user already exists, we still continue and ignore
    }
  });
}

export async function setPassword(params) {
  await new Promise((resolve, reject) => {
    try {
      COGNITO_CLIENT.send(new AdminSetUserPasswordCommand(params));
      resolve({ statusCode: 200, body: { message: "SUCCESS" } });
    } catch (err) {
      console.log("FAILED to update password", err, err.stack); // eslint-disable-line no-console
      reject({ statusCode: 500, body: { message: "FAILED", error: err } });
    }
  });
}

export async function updateUserAttributes(params) {
  await new Promise((resolve, reject) => {
    try {
      COGNITO_CLIENT.send(new AdminUpdateUserAttributesCommand(params));
      resolve({ statusCode: 200, body: { message: "SUCCESS" } });
    } catch (err) {
      console.log("FAILED to update user attributes", err, err.stack); // eslint-disable-line no-console
      reject({ statusCode: 500, body: { message: "FAILED", error: err } });
    }
  });
}
