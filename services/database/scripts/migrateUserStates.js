const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  paginateScan,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
  paginateListUsers,
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");

/*
 * This migration will convert `AuthUser.states` to `AuthUser.state`
 *
 * Previously, each user could be associated with any number of states.
 * - State users would always have a singleton array of states, like ["CO"]
 * - Admin users would not have a state at all; they administer all states.
 * - Business users would be associated with _some_ states.
 *   For example, we *could* have had a business user managing certifications
 *   for all states in the US Northeast, but with no access to souther states.
 *
 * But in practice, every business user was associated with every state.
 * They never saw a state dropdown with fewer than 51 options.
 * They would never receive a 403 when requesting a state's data.
 *
 * Therefore, the states array in the AuthUser table may as well be a string.
 * And now it will be. Well, a string or possibly undefined.
 *
 * This migration also addresses some minor inconsistencies in the data:
 * - `user.states` could be `""` or `"null"` or `[]`.
 *   Now `user.state` will be an uppercase 2-char string.
 *   Or, if the user has no state, the `state` key will be absent.
 * - `user.isSuperUser` was always `true` or `"true"`: All SEDS users are super.
 *   But this field was never used for any purpose, and now it will be gone.
 * - `user.password` was usually absent. When present, it was always `""`.
 *   But SEDS has never handled authentication, let alone by storing passwords.
 *   So now this field will be gone as well.
 * - `user.lastLogin` was previously updated:
 *     + When the user was created, OR
 *     + When an admin modified that user's permissions, BUT
 *     + Not when the user logged in.
 *   This made it nearly useless as an indicator of activity for a given user.
 *   It will no longer be updated when the user is modified by an admin,
 *   and it is now updated by user activity (see getCurrentUser.ts).
 *   To make it useful for past activity, this migration does a one-time update,
 *   using timestamps from Cognito as a proxy for user activity.
 *   These are a good proxy, for the users that have it:
 *   verified against `obtainUserByEmail` logs from the month of November 2025.
 */

/*
 * ENVIRONMENT VARIABLES TO SET:
 * AUTH_USER_TABLE_NAME: the name of the table in Dynamo
 * COGNITO_USER_POOL_ID: The UserPoolId for our Cognito user pool
 * [anything needed for AWS auth, if not local]
 */
const { AUTH_USER_TABLE_NAME, COGNITO_USER_POOL_ID } = process.env;

const awsConfig = {
  region: "us-east-1",
  logger: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error,
  },
};

const client = DynamoDBDocumentClient.from(new DynamoDBClient(awsConfig));
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    fractionalSecondDigits: 3
});
const logPrefix = () => dateFormatter.format(new Date()) + " | ";

/**
 * Use Cognito's `UserLastModifiedDate` to infer the last time a user logged in.
 * @returns {Map<string, string>} A mapping from `sub` to ISO date strings
 */
async function gatherLoginDatesFromCognito () {
  const cognitoClient = new CognitoIdentityProviderClient();
  const UserPoolId = COGNITO_USER_POOL_ID;
  const pages = paginateListUsers({ client: cognitoClient }, { UserPoolId });
  const modifyDates = new Map();
  for await (let page of pages) {
    for (let user of page.Users ?? []) {
      const sub = user.Attributes.find(attr => attr.Name === "sub").Value;
      modifyDates.set(sub, user.UserLastModifiedDate);
    }
  }
  return modifyDates;
}

/**
 * Given a user object, ensure it has the correct shape.
 * If not, modify it in-place.
 * @param {object} user The AuthUser record
 * @param {Map<string, string>} loginDates A trustworthy set of login dates
 * @returns `true` if a change was made; `false` if no change was needed.
 */
function updateUserState (user, loginDates) {
  const { role, states, usernameSub } = user;

  if (states === undefined) {
    // This user has already been migrated; no update necessary.
    return false;
  }

  if (role === "state" && Array.isArray(states)) {
    user.state = user.states[0];
  }

  // If we have a more trustworthy date, use it. Otherwise, leave what's there.
  user.lastLogin = loginDates.get(usernameSub) ?? user.lastLogin;

  delete user.states;
  delete user.isSuperUser;
  delete user.password;
  return true;
}

/**
 * Create an iterator for the entire table.
 * @param {string} TableName 
 */
async function * scanAllUsers (TableName) {
  console.log(`${logPrefix()}Scanning...`);
  let pageNumber = 0;
  let totalItemCount = 0;
  for await (let page of paginateScan({ client }, { TableName })) {
    pageNumber += 1;
    let pageItemCount = 0;
    for (let user of (page.Items ?? [])) {
      pageItemCount += 1;
      totalItemCount += 1;
      yield user;
    }
    console.log(`${logPrefix()}Completed scan of page ${pageNumber}; ${pageItemCount} items processed.`);
  }
  console.log(`${logPrefix()}Scan complete; ${totalItemCount} items in all.`);
}

/**
 * @param {AsyncGenerator<object>} userIterable 
 */
async function * filterAndModifyUsers (userIterable, loginDates) {
  for await (let user of userIterable) {
    const needsUpdate = updateUserState(user, loginDates);
    if (needsUpdate) {
      yield user;
    }
  }
}

/**
 * @param {AsyncGenerator<object>} itemIterable
 */
async function * createBatches (itemIterable) {
  let batch = [];

  for await (let item of itemIterable) {
    batch.push(item);
    if (batch.length === 25) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}

/**
 * Send BatchWriteCommands to Put the given objects in the given table.
 * @param {AsyncGenerator<object[]>} batches
 * @param {string} tableName
 * @param {(object) => string} idSelector For logging purposes.
 */
async function sendBatches (batches, tableName, idSelector) {
  for (let batch of batches) {
    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: batch.map((Item) => ({
          PutRequest: { Item }
        }))
      }
    });
    const response = await client.send(command);
    const unprocessedItems = response.UnprocessedItems?.[tableName];
    if (unprocessedItems && unprocessedItems.length > 0) {
      const ids = unprocessedItems.map((putRequest) => idSelector(putRequest.Item));
      throw new Error(
        `Batch write failed! The following items were not updated: ${ids.join(", ")}`
      );
    }
  }
}

async function main () {
  const lastLoginDates = await gatherLoginDatesFromCognito();
  const allUsers = scanAllUsers(AUTH_USER_TABLE_NAME);
  const usersToUpdate = filterAndModifyUsers(allUsers, lastLoginDates);
  const batches = createBatches(usersToUpdate);
  await sendBatches(AUTH_USER_TABLE_NAME, batches, user => user.userId);
}

main();
