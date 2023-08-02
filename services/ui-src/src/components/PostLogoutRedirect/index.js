import React from "react";
import config from "../../config/config";

export const PostLogoutRedirect = () => {
  window.location.href = config.POST_SIGNOUT_REDIRECT;
  return <></>;
};
