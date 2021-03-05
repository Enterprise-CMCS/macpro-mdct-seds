import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { withRouter, Link } from "react-router-dom";
// import { fetchFormTypes } from "../store/reducers/global";
import { getFormTypes } from "../../src/libs/api";

const FormHeader = ({ quarter, form, year, state, formTypes }) => {
  const [formDescription, setFormDescription] = useState({});

  useEffect(() => {
    async function fetchData() {
      const data = await getFormTypes();
      const formDetails = data.find(element => element.form === form);
      setFormDescription(formDetails);
    }
    fetchData();
  }, []);

  return (
    <GridContainer>
      <Grid row className="upper-form-nav">
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

      <Grid row className="form-description-bar">
        <p>FORM {form}</p>
        <hr className="solid" />
        <h2>{formDescription.form_name}</h2>
        <p> {formDescription.form_text}</p>
      </Grid>

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

// FormHeader.propTypes = {
//   formTypes: PropTypes.object.isRequired,
//   getFormTypes: PropTypes.func.isRequired
// };

export default withRouter(FormHeader);
