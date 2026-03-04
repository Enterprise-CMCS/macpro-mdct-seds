import { AuthUser } from "../storage/users.ts";

/**
 * Admin and business users can read data from every state.
 * State users can read data from their own state.
 */
export const canReadDataForState = (user: AuthUser, state: string) => {
  if (user.role === "admin" || user.role === "business") {
    return true;
  }
  if (user.role === "state" && user.state === state) {
    return true;
  }
  return false;
};

/**
 * Business users can modify form status for any state.
 * State users can modify form status for their own state.
 */
export const canWriteStatusForState = (user: AuthUser, state: string) => {
  if (user.role === "business") {
    return true;
  }
  if (user.role === "state" && user.state === state) {
    return true;
  }
  return false;
};

/**
 * Only state users can modify form answers, and only for their own state.
 */
export const canWriteAnswersForState = (user: AuthUser, state: string) => {
  if (user.role === "state" && user.state === state) {
    return true;
  }
  return false;
};
