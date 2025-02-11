import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "react-bootstrap";
import { useAppContext } from "../../libs/contextLib";
// import { loginLocalUser } from "../../libs/user";
import { Grid, GridContainer } from "@trussworks/react-uswds";

export default function Login() {
  const { setIsAuthenticated } = useAppContext();
  let history = useHistory();

  function loginUser() {
    const alice = {
      firstName: "Alice",
      lastName: "Cooper",
      lastLogin: "2021-10-01T12:46:35.838Z",
      "custom:ismemberof": "admin",
      // 'custom:ismemberof':
      //   "cn=CARTS_Group_Dev,ou=Groups,dc=cms,dc=hhs,dc=gov,cn=CARTS_Group_Dev_Admin,ou=Groups,dc=cms,dc=hhs,dc=gov,cn=CHIP_D_USER_GROUP_ADMIN,ou=Groups,dc=cms,dc=hhs,dc=gov,cn=IDM_OKTA_TEST,ou=Groups,dc=cms,dc=hhs,dc=gov",
      dateJoined: "2021-10-01T12:46:35.838Z",
      isSuperUser: "true",
      userId: "1",
      email: "alicecooper@collabralink.com",
      identities: [{ userId: "AAAA" }],
      states: ["TX", "MD", "PA"],
      localLogin: true,
      password: "password"
    };

    // loginLocalUser(alice);
    setIsAuthenticated(true);
    history.push("/");
    history.go(0);
  }

  // if (payload) {
  //   console.log(payload)
  //   payload.role = determineRole("CHIP_D_USER_GROUP_ADMIN")
  //   payload.username = payload["cognito:username"];
  //   if (payload.role) setIsAuthenticating(true);
  // } else history.push("/login");

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
