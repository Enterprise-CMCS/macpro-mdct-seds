import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { onError } from "../libs/errorLib";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Profile.css";
import { Auth } from "aws-amplify";
import "react-phone-input-2/lib/style.css";
import { currentUserInfo } from "../libs/user";
import { Grid, GridContainer } from "@trussworks/react-uswds";

export default function Profile() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [states, setStates] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const capitalize = s => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  useEffect(() => {
    function loadProfile() {
      return currentUserInfo();
    }

    async function onLoad() {
      try {
        const userInfo = await loadProfile();
        setEmail(userInfo.attributes.email);
        setFirstName(capitalize(userInfo.attributes.first_name));
        setLastName(capitalize(userInfo.attributes.last_name));
        setRole(capitalize(userInfo.attributes.role));
        setStates(formatStates(userInfo.attributes.states));
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, []);

  function validateForm() {
    return (
      email.length > 0 && firstName.length > 0 && lastName.length && role.length
    );
  }

  function saveProfile(user, userAttributes) {
    return Auth.updateUserAttributes(user, userAttributes);
  }

  function formatStates(states) {
    let statesRefined = "";

    // Sort alphabetically
    states.sort();

    // Create string from array, add in commas
    states.forEach((value, i) => {
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
    let user = await Auth.currentAuthenticatedUser();
    try {
      await saveProfile(user, {
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
      <GridContainer className="container">
        <Grid row>
          <Grid col={12}>
            <form onSubmit={handleSubmit}>
              <FormGroup controlId="email">
                <ControlLabel>Email</ControlLabel>
                <FormControl value={email} disabled={true} />
              </FormGroup>
              <FormGroup controlId="firstName">
                <ControlLabel>First Name</ControlLabel>
                <FormControl
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="lastName">
                <ControlLabel>Last Name</ControlLabel>
                <FormControl
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="role">
                <ControlLabel>Role</ControlLabel>
                <FormControl
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="states">
                <ControlLabel>States</ControlLabel>
                <FormControl value={states} disabled={true} />
              </FormGroup>
              <LoaderButton
                block
                type="submit"
                bsSize="large"
                bsStyle="primary"
                isLoading={isLoading}
                disabled={!validateForm()}
              >
                Save
              </LoaderButton>
            </form>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
