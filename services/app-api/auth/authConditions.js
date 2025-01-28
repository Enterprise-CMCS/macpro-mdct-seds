import { getCurrentUserInfo } from "../auth/cognito-auth.js";

/** Throws an exception unless the current user is authenticated. */
export const authorizeAnyUser = async (event) => {
  const user = (await getCurrentUserInfo(event)).data;
  if (!user.email) {
    throw new Error("Forbidden");
  }
};

/** Throws an exception unless the current user is an admin. */
export const authorizeAdmin = async (event) => {
  const user = (await getCurrentUserInfo(event)).data;
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
};

/** Throws an exception unless the current user is an admin, or they have the given email. */
export const authorizeAdminOrUserWithEmail = async (event, email) => {
  const user = (await getCurrentUserInfo(event)).data;
  if (user.role !== "admin" && user.email !== email) {
    throw new Error("Forbidden");
  }
};

/** Throws an exception unless the current user is an admin, or they have access to the given state. */
export const authorizeAdminOrUserForState = async (event, state) => {
  const user = (await getCurrentUserInfo(event)).data;
  if (user.role !== "admin" && !user.states.includes(state)) {
    throw new Error("Forbidden");
  }
};

/** Throws an exception unless the current user is a state user with access to the given state. */
export const authorizeStateUser = async (event, state) => {
  const user = (await getCurrentUserInfo(event)).data;
  if (user.role !== "state" || !user.states.includes(state)) {
    throw new Error("Forbidden");
  }
};

export const authorizeUserForState = async (event, state) => {
  const user = (await getCurrentUserInfo(event)).data;
  if (
    !["state", "business"].includes(user.role) ||
    !user.states.includes(state)
  ) {
    throw new Error("Forbidden");
  }
};
