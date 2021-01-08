import React from "react";
import StatusButton from "./StatusButton";
import { Alert, Button, Grid, GridContainer } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilePdf,
  faArrowLeft,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const Example = () => {
  return (
    <GridContainer className="status-buttons container">
      <Grid row>
        <Grid col={12}>
          <h2>Status Buttons</h2>
          <StatusButton type="inprogress" />
          <StatusButton type="complete" />
          <StatusButton type="provisional" />
          <StatusButton type="final" />
          <StatusButton type="notstarted" />
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Regular Buttons</h2>
          <Button>Submit</Button>
          <Button className="hollow">Save</Button>
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Icons</h2>
          PDF <FontAwesomeIcon icon={faFilePdf} /> <br />
          Arrow Left <FontAwesomeIcon icon={faArrowLeft} />
          <br />
          Arrow Right <FontAwesomeIcon icon={faArrowRight} />
        </Grid>
      </Grid>
      <Grid row>
        <Grid col={12}>
          <h2>Alerts</h2>
          <Alert type="success" heading="Success status">
            Success Message contents
          </Alert>
          <Alert type="warning" heading="Warning status">
            Warning Message contents
          </Alert>
          <Alert type="error" heading="Error status">
            Error Message contents
          </Alert>
          <Alert type="info" heading="Info status">
            Info Message contents
          </Alert>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default Example;
