import React from "react";
import { Grid } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";

const HomeAdmin = () => {
  return (
    <Grid row className="page-home-admin">
      <Grid col={12}>
        <h1>Home Admin User Page</h1>
        <ul>
          <li>
            <Link to="/users">View/Edit users</Link>
          </li>
          <li>
            <Link to="/users/add">Create user</Link>
          </li>
        </ul>
      </Grid>
    </Grid>
  );
};

export default HomeAdmin;
