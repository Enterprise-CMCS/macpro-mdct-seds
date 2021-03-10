import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Grid, GridContainer } from "@trussworks/react-uswds";
import { Link } from "react-router-dom";
import { getFormTypes } from "../../../src/libs/api";

const FormHeader = ({ quarter, form, year, state }) => {
  const [formDescription, setFormDescription] = useState({});

  useEffect(() => {
    async function fetchData() {
      const data = await getFormTypes();
      const formDetails = data.find(element => element.form === form);
      setFormDescription(formDetails);
    }
    fetchData();
  }, [quarter, form, state, year]);

  return (
    <GridContainer>
      <Grid row className="upper-form-nav">
        <Link className="upper-form-links" to="/">
          {" "}
          Enrollment Data Home {">"}
          {"   "}
        </Link>
        <Link
          className="upper-form-links"
          to={`/forms/${state}/${year}/${quarter}`}
        >
          {` Q${quarter} ${year} > `}
        </Link>
        <Link className="upper-form-links" to={window.location.pathname}>
          {" "}
          {` Form ${form}`}{" "}
        </Link>
      </Grid>

      <Grid row className="form-description-bar">
        <h5>FORM {form}</h5>
        <hr />
        <h2 className="form-name">{formDescription.form_name}</h2>
        <p className="form-description"> {formDescription.form_text}</p>
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

FormHeader.propTypes = {
  quarter: PropTypes.string.isRequired,
  form: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired
};

export default FormHeader;
