import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { onError } from "../../libs/errorLib";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Profile.scss";
import {
  updateUserAttributes
} from "aws-amplify/auth";
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
  /* eslint-disable no-unused-vars */
  const [isLoading, setIsLoading] = useState(false);

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

  function validateForm() {
    return (
      email.length > 0 && firstName.length > 0 && lastName.length && role.length
    );
  }

  function saveProfile(userAttributes) {
    return updateUserAttributes({userAttributes: userAttributes}); // TODO This can't actually be used?
  }

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

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      await saveProfile({
        first_name: firstName,
        last_name: lastName
      });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  return (
    <div className="Profile">
      <h1 className="page-header">Profile</h1>
      <GridContainer className="container">
        <Grid row>
          <Grid col={12}>
            <form onSubmit={handleSubmit} data-testid="handleSubmit">
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
