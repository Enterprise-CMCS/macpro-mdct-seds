import React from "react";
import PropTypes from "prop-types";
import { Grid, GridContainer, Button } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";

// FontAwesome / Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const FormFooter = ({ state, year, quarter, lastModified }) => {
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

FormFooter.propTypes = {
  state: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  quarter: PropTypes.string.isRequired,
  lastModified: PropTypes.string
};

export default FormFooter;
