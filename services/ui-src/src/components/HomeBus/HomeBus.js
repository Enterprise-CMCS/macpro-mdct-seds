import React from "react";
import { Grid } from "@trussworks/react-uswds";

const HomeBus = () => {
  return (
    <Grid row className="page-home-bus" data-testid="HomeBus">
      <Grid col={12}>
        <h1>Home Business User Page</h1>
      </Grid>
    </Grid>
  );
};

export default HomeBus;
