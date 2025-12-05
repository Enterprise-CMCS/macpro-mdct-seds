import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { onError } from "../../libs/errorLib";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Profile.scss";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { getUserInfo } from "../../utility-functions/userFunctions";

export default function Profile({ user }) {
  const history = useHistory();
  /* eslint-disable no-unused-vars */
  const [email, setEmail] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [role, setRole] = useState();
  const [states, setStates] = useState();

  const capitalize = s => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  useEffect(() => {
    const onLoad = async () => {
      try {
        let currentUserInfo = await getUserInfo();

        let userObj = currentUserInfo["Items"];
        for (const userInfo of userObj) {
          setEmail(userInfo.email);
          setFirstName(capitalize(userInfo.firstName));
          setLastName(capitalize(userInfo.lastName));
          setRole(capitalize(userInfo.role));
          if (userInfo.states) {
            setStates(formatStates(userInfo.states));
          }
        }
      } catch (e) {
        onError(e);
      }
    };

    onLoad();
  });

  function formatStates(states) {
    let statesRefined = "";

    // Sort alphabetically
    const statesArray = states.sort();

    // Create string from array, add in commas
    statesArray.forEach((value, i) => {
      if (i === 0) {
        statesRefined += value;
      } else {
        statesRefined += ", " + value;
      }
    });

    return statesRefined;
  }

  return (
    <div className="Profile">
      <h1 className="page-header">Profile</h1>
      <GridContainer className="container">
        <Grid row>
          <Grid col={12}>
            <form>
              <FormGroup controlId="email">
                <ControlLabel>Email</ControlLabel>
                <FormControl value={email ?? ""} disabled={true} />
              </FormGroup>
              <FormGroup controlId="firstName">
                <ControlLabel>First Name</ControlLabel>
                <FormControl
                  value={firstName ?? ""}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="lastName">
                <ControlLabel>Last Name</ControlLabel>
                <FormControl
                  value={lastName ?? ""}
                  onChange={e => setLastName(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="role">
                <ControlLabel>Role</ControlLabel>
                <FormControl
                  value={capitalize(role ?? "")}
                  onChange={e => setRole(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="states">
                <ControlLabel>States</ControlLabel>
                <FormControl value={states ?? []} disabled={true} />
              </FormGroup>
            </form>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
