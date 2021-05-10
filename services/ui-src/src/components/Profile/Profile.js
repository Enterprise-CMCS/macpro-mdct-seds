import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { onError } from "../../libs/errorLib";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Profile.scss";
import { Auth } from "aws-amplify";
import "react-phone-input-2/lib/style.css";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { obtainUserByEmail, obtainUserByUsername } from "../../libs/api";

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
        const AuthUserInfo = await Auth.currentAuthenticatedUser();
        console.log("This i sthe current user: ", AuthUserInfo);

        Auth.currentSession()
          .then(data => {
            let idToken = data.getIdToken();
            console.log(idToken);
            console.log("This is the current user Token: ", idToken);
            
            console.dir(idToken);
          })
          .catch(err => console.log(err));

        // const currentUserInfo = await obtainUserByEmail({
        //   email: AuthUserInfo.attributes.email
        // });
        const currentUserInfo = await obtainUserByUsername({
          username: AuthUserInfo.username
        });
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

  function saveProfile(user, userAttributes) {
    return Auth.updateUserAttributes(user, userAttributes);
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
    <div className="Profile react-transition fade-in">
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
                  value={capitalize(role)}
                  onChange={e => setRole(e.target.value)}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="states">
                <ControlLabel>States</ControlLabel>
                <FormControl value={states} disabled={true} />
              </FormGroup>
            </form>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
