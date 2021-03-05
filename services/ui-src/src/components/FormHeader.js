import React from "react";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { withRouter, Link } from "react-router-dom";

const FormHeader = ({ quarter, form, year, state, history }) => {
  return (
    <GridContainer>
      <Grid row>
        <Link to="/">
          {" "}
          Enrollment Data Home {">"}
          {"   "}
        </Link>
        <Link to={`/forms/${state}/${year}/${quarter}`}>
          {`Q${quarter} ${year}`}
        </Link>
        <Link> {`Form ${form}`} </Link>
      </Grid>

      <p>FORM {form}</p>
      <hr class="solid" />
      <h2>Number of CHIP Children Served, Separate Child Health Program</h2>

      <Grid row className="program-code-bar">
        <Grid col={6}>
          <b>State: </b> <br />
          {` ${state}`}
        </Grid>
        <Grid col={6}>
          <b>Quarter: </b> <br />
          {` ${quarter}/${year}`}
        </Grid>
      </Grid>
    </GridContainer>
  );
};

export default withRouter(FormHeader);
