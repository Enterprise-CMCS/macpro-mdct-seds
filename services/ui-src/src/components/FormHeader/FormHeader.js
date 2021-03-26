import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Grid,
  GridContainer,
  Link,
  TextInput
} from "@trussworks/react-uswds";
// import { Link } from "react-router-dom";
import { getFormTypes, getSingleForm } from "../../libs/api";
import "./FormHeader.scss";

const FormHeader = ({ quarter, form, year, state }) => {
  const [formDescription, setFormDescription] = useState({});
  const [maxFPL, setMaxFPL] = useState("");
  const formsWithOutFPL = ["GRE"];

  // Returns last three digits of maximum FPL range
  const getMaxFPL = answers => {
    // Finds first question (in answers), first row, then column 6
    const fplRange = answers[0]["rows"][0].col6;

    // Strips out last three digits (ex. get 317 from `% of FPL 301-317`)
    return fplRange.substring(fplRange.length - 3);
  };
  useEffect(() => {
    async function fetchData() {
      const data = await getFormTypes();
      const formDetails = data.find(element => element.form === form);
      setFormDescription(formDetails);

      // Only get FPL data if correct form
      if (!formsWithOutFPL.includes(form)) {
        // Get answers for this form from DB
        const { answers } = await getSingleForm(state, year, quarter, form);

        // Determine Maximum FPL
        const maxFPL = getMaxFPL(answers);
        setMaxFPL(maxFPL);
      }
    }
    fetchData();
  }, [quarter, form, state, year]);

  // Saves maximum FPL to the database
  const updateMaxFPL = e => {};

  // Ensure user input is valid for max FPL
  const validateFPL = e => {
    let value = e.target.value;

    // Halt input if greater than 3 chars
    value = value.length < 4 ? value : value.substring(0, 3);

    // Remove all non-numeric chars
    value = value.replace(/[^\d]/g, "");

    setMaxFPL(value);
  };

  return (
    <GridContainer className="form-header">
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
      {!formsWithOutFPL.includes(form) ? (
        <Grid row className="form-max-fpl">
          <Grid col={12}>
            <p>
              What is the highest FPL that received benefits from your state?
            </p>
            <div className="fpl-input">
              <TextInput
                id="max-fpl"
                name="max-fpl"
                type="number"
                onChange={e => validateFPL(e)}
                value={maxFPL}
              ></TextInput>
            </div>
            <div className="fpl-button">
              <Button
                type="button"
                className="max-fpl-btn"
                onClick={updateMaxFPL}
              >
                Apply FPL Changes
              </Button>
            </div>
          </Grid>
        </Grid>
      ) : null}
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
