import React from "react";
import "./Profile.scss";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { useStore } from "../../store/store";
import { TextField } from "@cmsgov/design-system";

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
              <TextField
                key="email"
                name="email"
                label="Email"
                value={email}
                disabled={true}
              ></TextField>
              <TextField
                key="firstName"
                name="firstName"
                label="First Name"
                value={firstName}
                disabled={true}
              ></TextField>
              <TextField
                key="lastName"
                name="lastName"
                label="Last Name"
                value={lastName}
                disabled={true}
              ></TextField>
              <TextField
                key="role"
                name="role"
                label="Role"
                value={role}
                disabled={true}
              ></TextField>
              <TextField
                key="state"
                name="state"
                label="State"
                value={state}
                disabled={true}
              ></TextField>
            </form>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
