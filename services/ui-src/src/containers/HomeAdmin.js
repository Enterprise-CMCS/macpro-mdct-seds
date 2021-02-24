import React from "react";
import { Grid } from "@trussworks/react-uswds";

const HomeAdmin = () => {
  return (
    <Grid row className="page-home-admin">
      <Grid col={12}>
        <h1>Home Admin User Page</h1>
        <ul>
          <li>
            <a href="/users">View/Edit users</a>
          </li>
          <li>
            <a href="/users/add">Create user</a>
          </li>
        </ul>
      </Grid>
    </Grid>
  );
};

export default HomeAdmin;
