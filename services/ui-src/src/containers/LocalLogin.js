import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { loginLocalUser } from "../libs/user";

export default function Login() {
  const { userHasAuthenticated } = useAppContext();
  let history = useHistory();

  function loginUser() {
    const alice = {
      username: "alice",
      attributes: {
        first_name: "Alice",
        last_name: "Foo",
        email: "alice@example.com",
        role: "admin",
        states: ["DC", "MD", "AZ"]
      }
    };
    loginLocalUser(alice);
    userHasAuthenticated(true);
    history.push("/");
    history.go(0);
  }

  return (
    <div className="Login">
      <p>Login locally here:</p>
      <Button onClick={loginUser}>Login as Alice</Button>
    </div>
  );
}
