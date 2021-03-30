import React from "react";
import { Grid, GridContainer } from "@trussworks/react-uswds";

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <GridContainer className="container page-login">
        <Grid row>
          <Grid col={12}>
            <h1>Unauthorized</h1>
            <p>You are not authorized to view this page.</p>
            <p>
              If you feel this is an error, please contact the helpdesk{" "}
              <a href="mailto:cartshelp@cms.hhs.gov">cartshelp@cms.hhs.gov</a>
            </p>
          </Grid>
        </Grid>
      </GridContainer>
    </div>
  );
};

export default Unauthorized;
