import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, TextInput, Table } from "@trussworks/react-uswds";
import { getFormTypes, getSingleForm } from "../../libs/api";
import "./FormHeader.scss";
import {
  updateFPL,
  saveForm
} from "../../store/reducers/singleForm/singleForm";

const FormHeader = ({
  quarter,
  form,
  year,
  state,
  updateFPL,
  saveForm,
  statusData
}) => {
  const [formDescription, setFormDescription] = useState({});
  const [maxFPL, setMaxFPL] = useState("");
  const [showFPL, setShowFPL] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { status_id } = statusData;

  // Returns last three digits of maximum FPL range
  const getMaxFPL = answers => {
    // Finds first question (in answers), first row, then column 6
    const fplRange = answers[0]["rows"][0].col6;

    // Strips out last three digits (ex. get 317 from `% of FPL 301-317`)
    return fplRange.substring(fplRange.length - 3);
  };

  useEffect(() => {
    // List of forms that do NOT show fpl
    if (status_id === 4) {
      setDisabled(true);
    } else setDisabled(false);
    const formsWithOutFPL = ["GRE"];
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
        setShowFPL(true);
      }
    }
    fetchData();
  }, [quarter, form, state, year, status_id]);

  // Saves maximum FPL to the database
  const updateMaxFPL = async () => {
    await updateFPL(maxFPL).then(() => saveForm());
  };

  // Ensure user input is valid for max FPL
  const validateFPL = e => {
    let value = e.target.value;

    // Halt input if greater than 3 chars
    value = value.length < 4 ? value : value.substring(0, 3);

    // Remove all non-numeric chars
    value = value.replace(/[^\d]/g, "");

    // Save to state
    setMaxFPL(value);
  };

  return (
    <>
      <div row className="form-header upper-form-nav">
        <div className="breadcrumbs">
          <Link to="/">
            {" "}
            Enrollment Data Home {">"}
            {"   "}
          </Link>
          <Link to={`/forms/${state}/${year}/${quarter}`}>
            {`${state} Q${quarter} ${year} > `}
          </Link>
          <Link to={window.location.pathname}> {` Form ${form}`} </Link>
        </div>
      </div>
      <h1 className="page-header">FORM {form}</h1>
      <hr />
      <div className="padding-x-5">
        <div className="margin-y-2">
          <h2 className="form-name">{formDescription.form_name}</h2>
          <p className="instructions"> {formDescription.form_text}</p>
        </div>
        <div className="unstyled padding-bottom-3 padding-top-1">
          <Table>
            <tbody>
              <tr>
                <th>
                  <b>State:</b>
                </th>
                <td className="state-value">{`${state}`}</td>

                <th>
                  <b>Quarter:</b>
                </th>
                <td className="quarter-value">{`${quarter}/${year}`}</td>
              </tr>
            </tbody>
          </Table>
        </div>

        {showFPL ? (
          <div className="form-max-fpl">
            <p>What is the upper income eligibility limit for this program?</p>
            <p>
              <i>If the FPL is under 300% you do not need to indicate FPL</i>
            </p>
            <div className="fpl-input">
              <TextInput
                id="max-fpl"
                name="max-fpl"
                type="number"
                onChange={e => validateFPL(e)}
                value={maxFPL}
                disabled={disabled}
              />
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
          </div>
        ) : null}
      </div>
    </>
  );
};

FormHeader.propTypes = {
  quarter: PropTypes.string.isRequired,
  form: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  state: PropTypes.string.isRequired,
  updateFPL: PropTypes.func.isRequired,
  saveForm: PropTypes.func.isRequired
};

const mapState = state => ({
  statusData: state.currentForm.statusData
});

const mapDispatch = {
  updateFPL: updateFPL ?? {},
  saveForm: saveForm ?? {}
};

export default connect(mapState, mapDispatch)(FormHeader);
