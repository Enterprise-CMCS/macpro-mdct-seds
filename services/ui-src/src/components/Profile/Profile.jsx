import React from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Profile.scss";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { useStore } from "../../store/store";

export default function Profile() {
  const user = useStore(state => state.user);

  const capitalize = s => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const email = user.email ?? "";
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const role = capitalize(user.role);
  const state = user.state ?? "";

  return (
    <div className="Profile">
      <h1 className="page-header">Profile</h1>
      <GridContainer className="container">
        <Grid row>
          <Grid col={12}>
            <form>
              <FormGroup controlId="email">
                <ControlLabel>Email</ControlLabel>
                <FormControl value={email} disabled={true} />
              </FormGroup>
              <FormGroup controlId="firstName">
                <ControlLabel>First Name</ControlLabel>
                <FormControl
                  value={firstName}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="lastName">
                <ControlLabel>Last Name</ControlLabel>
                <FormControl
                  value={lastName}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="role">
                <ControlLabel>Role</ControlLabel>
                <FormControl
                  value={role}
                  disabled={true}
                />
              </FormGroup>
              <FormGroup controlId="state">
                <ControlLabel>State</ControlLabel>
                <FormControl value={state} disabled={true} />
              </FormGroup>
            </form>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
