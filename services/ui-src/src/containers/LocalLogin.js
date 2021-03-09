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
      "custom:ismemberof": "admin",
      // 'custom:ismemberof':
      //   "cn=CARTS_Group_Dev,ou=Groups,dc=cms,dc=hhs,dc=gov,cn=CARTS_Group_Dev_Admin,ou=Groups,dc=cms,dc=hhs,dc=gov,cn=CHIP_D_USER_GROUP_ADMIN,ou=Groups,dc=cms,dc=hhs,dc=gov,cn=IDM_OKTA_TEST,ou=Groups,dc=cms,dc=hhs,dc=gov",
      dateJoined: "01/22/2021",
      isSuperUser: "true",
      isActive: "true",
      userId: "1",
      email: "alicecooper@collabralink.com",
      identities: [{ userId: "AAAA" }],
      states: "AL-MD-PA",
      localLogin: true
    };

    loginLocalUser(alice);
    console.log(userHasAuthenticated)
    userHasAuthenticated(true);
    console.log(userHasAuthenticated)
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
