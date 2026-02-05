import React from "react";
import { Form } from "react-bootstrap";
import "./Profile.scss";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { useStore } from "../../store/store";

export default function Profile() {
  const user = useStore((state) => state.user);

  const capitalize = (s) => {
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
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control value={email} disabled={true} />
              </Form.Group>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control value={firstName} disabled={true} />
              </Form.Group>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control value={lastName} disabled={true} />
              </Form.Group>
              <Form.Group controlId="role">
                <Form.Label>Role</Form.Label>
                <Form.Control value={role} disabled={true} />
              </Form.Group>
              <Form.Group controlId="state">
                <Form.Label>State</Form.Label>
                <Form.Control value={state} disabled={true} />
              </Form.Group>
            </form>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
}
