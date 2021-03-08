import React from "react";
import { Route } from "react-router-dom";
// import { useAppContext } from "../libs/contextLib";

function querystring(name, url = window.location.href) {
  /* eslint-disable no-param-reassign */
  name = name.replace(/[[]]/g, "\\$&");

  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i");
  const results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export default function UnauthenticatedRoute({ children, ...rest }) {
  return <Route {...rest}>{children}</Route>;
}
