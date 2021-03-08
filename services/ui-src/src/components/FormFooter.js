import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Grid, GridContainer, Button } from "@trussworks/react-uswds";
import { withRouter, Link } from "react-router-dom";
import { getFormTypes } from "../../src/libs/api";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const FormFooter = ({ state, year, quarter, history, lastModified }) => {
  const quarterPath = `/forms/${state}/${year}/${quarter}`;
  return (
    <GridContainer>
      <Grid row>
        <Grid col={6} className="form-nav">
          <Link to={quarterPath}>
            {" "}
            <FontAwesomeIcon icon={faArrowLeft} /> Back to{" "}
            {`Q${quarter} ${year}`}
          </Link>
        </Grid>

        <Grid col={6} className="form-actions">
          <Grid row>
            <Grid col={6}> Last saved: {lastModified} </Grid>
            <Grid col={6}>
              {" "}
              <Button className="hollow">Save</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default withRouter(FormFooter);
