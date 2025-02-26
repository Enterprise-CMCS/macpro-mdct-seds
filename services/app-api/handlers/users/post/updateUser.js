import handler from "../../../libs/handler-lib.js";
import dynamoDb from "../../../libs/dynamodb-lib.js";
import { obtainUserByEmail } from "./obtainUserByEmail.js";
import {
  authorizeAdmin,
  authorizeAdminOrUserWithEmail,
  authorizeAnyUser,
} from "../../../auth/authConditions.js";

export const main = handler(async (event, context) => {
  await authorizeAnyUser(event);

  const data = JSON.parse(event.body);
  const currentUser = await obtainUserByEmail(data.email);

  await authorizeAdminOrUserWithEmail(event, currentUser.Items[0].email);

  if (modifyingAnythingButAnEmptyStateList(data, currentUser.Items[0])) {
    await authorizeAdmin(event);
  }

  assertPayloadIsValid(data);

  const params = {
    TableName:
      process.env.AUTH_USER_TABLE_NAME ?? process.env.AuthUserTableName,
    Key: {
      userId: currentUser["Items"][0].userId,
    },
    UpdateExpression:
      "SET #r = :role, states = :states, lastLogin = :lastLogin",
    ExpressionAttributeValues: {
      ":role": data.role,
      ":states": data.states ?? "",
      ":lastLogin": new Date().toISOString(),
    },
    ExpressionAttributeNames: {
      "#r": "role",
    },

    ReturnValues: "ALL_NEW",
  };

  return await dynamoDb.update(params);
});

function modifyingAnythingButAnEmptyStateList(incomingUser, existingUser) {
  if (incomingUser.username !== existingUser.username) return true;
  if (incomingUser.role !== existingUser.role) return true;
  if (incomingUser.usernameSub !== existingUser.usernameSub) return true;
  if (existingUser.states.length > 0) return true;
  return false;
}

function assertPayloadIsValid (data) {
  if (!data) {
    throw new Error("User update payload is missing");
  }

  if (typeof data.role !== "string" || !data.role) {
    throw new Error("Invalid user role - must be a nonempty string");
  }
  if (!["admin", "business", "state"].includes(data.role)) {
    throw new Error("Invalid user role - must be an existing role");
  }

  if (data.states && data.states !== "null") {
    if (!Array.isArray(data.states)) {
      throw new Error("Invalid user states - must be an array");
    }
    for (let state of data.states) {
      if (typeof state !== "string") {
        throw new Error("Invalid user states - must be strings");
      }
      if (!/^[A-Z]{2}$/.test(state)) {
        throw new Error("Invalid user states - must be 2-letter abbreviations");
      }
    }
  }
}
