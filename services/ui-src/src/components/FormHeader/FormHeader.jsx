import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button, TextInput } from "@cmsgov/design-system";
import { getSingleForm } from "../../libs/api";
import { formTypes } from "../../utility-functions/constants";
import { useStore } from "../../store/store";

const FormHeader = ({ quarter, form, year, state }) => {
  const updateFPL = useStore((state) => state.updateFpl);
  const userRole = useStore((state) => state.user.role);
  const saveForm = useStore((state) => state.saveForm);
  const formDescription = formTypes.find((element) => element.form === form);
  const [maxFPL, setMaxFPL] = useState("");
  const [showFPL, setShowFPL] = useState(false);

  // Returns last three digits of maximum FPL range
  const getMaxFPL = (answers) => {
    // Finds first question (in answers), first row, then column 6
    const fplRange = answers[0]["rows"][0].col6;

    // Strips out last three digits (ex. get 317 from `% of FPL 301-317`)
    return fplRange.substring(fplRange.length - 3);
  };

  useEffect(() => {
    // List of forms that do NOT show fpl
    const formsWithOutFPL = ["GRE"];
    async function fetchData() {
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
  }, [quarter, form, state, year]);

  // Saves maximum FPL to the database
  const updateMaxFPL = async () => {
    await updateFPL(maxFPL).then(() => saveForm());
  };

  // Ensure user input is valid for max FPL
  const validateFPL = (e) => {
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
      <div>
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
      <h1>FORM {form}</h1>
      <hr />
      <div>
        <div>
          <h2>{formDescription.form_name}</h2>
          <p> {formDescription.form_text}</p>
        </div>
        <div>
          <table className="unstyled">
            <tbody>
              <tr>
                <th>
                  <b>State:</b>
                </th>
                <td>{`${state}`}</td>

                <th>
                  <b>Quarter:</b>
                </th>
                <td>{`${quarter}/${year}`}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {showFPL ? (
          <div data-testid="form-max-fpl">
            <p>What is the upper income eligibility limit for this program?</p>
            <p>
              <i>If the FPL is under 300% you do not need to indicate FPL</i>
            </p>
            <div>
              <div>
                <TextInput
                  id="max-fpl"
                  name="max-fpl"
                  type="number"
                  onChange={(e) => validateFPL(e)}
                  value={maxFPL}
                />
              </div>
              <div>
                <Button
                  variation="solid"
                  onClick={updateMaxFPL}
                  disabled={userRole !== "state"}
                >
                  Apply FPL Changes
                </Button>
              </div>
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
};

export default FormHeader;
