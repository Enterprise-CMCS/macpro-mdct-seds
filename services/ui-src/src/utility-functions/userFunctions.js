import { getCurrentUser } from "../libs/api";
import { onError } from "../libs/errorLib";

export const getUserInfo = async () => {
  try {
    const currentUser = await getCurrentUser();
    return { Items: [currentUser] };
  } catch (e) {
    onError(e);
    return undefined;
  }
};
