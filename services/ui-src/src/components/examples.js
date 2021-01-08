import React from "react";
import StatusButton from "./StatusButton";
import { Grid, GridContainer } from "@trussworks/react-uswds";

const Example = () => {
  return (
    <GridContainer className="status-buttons container">
      <Grid row>
        <Grid col={12}>
          <StatusButton type="inprogress" />
          <StatusButton type="complete" />
          <StatusButton type="provisional" />
          <StatusButton type="final" />
          <StatusButton type="notstarted" />
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default Example;
