import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { loginLocalUser } from "../libs/user";
import { Grid, GridContainer } from "@trussworks/react-uswds";

export default function Login() {
  const { userHasAuthenticated } = useAppContext();
  let history = useHistory();

  function loginUser() {
    const alice = {
      firstName: "Alice",
      lastName: "Cooper",
      lastLogin: "01/28/2021",
      role: "business",
      dateJoined: "01/22/2021",
      isSuperUser: "true",
      isActive: "true",
      userId: "1",
      email: "alicecooper@collabralink.com",
      username: "AAAA",
      states: "AL-MD-PA",
      localLogin: true
    };

    loginLocalUser(alice);
    userHasAuthenticated(true);
    history.push("/");
    history.go(0);
  }

  return (
    <div className="Login">
      <GridContainer className="container page-login">
        <Grid row>
          <Grid col={12}>
            <p>Login locally here:</p>
            <Button onClick={loginUser}>Login as Alice</Button>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
