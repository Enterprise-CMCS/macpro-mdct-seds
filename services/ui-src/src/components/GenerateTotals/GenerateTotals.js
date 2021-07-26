import React, { useState } from "react";
import { Alert, Button } from "@trussworks/react-uswds";

import {
  generateEnrollmentTotals,
  obtainStateForms,
  obtainAnswerEntriesFromForms
} from "../../libs/api";
import "./GenerateTotals.scss";

const GenerateTotals = () => {
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    const proceed = window.confirm(
      "You are about to create new Enrollment Totals. This action cannot be undone. Do you wish to proceed?"
    );

    if (proceed) {
      // Start loading icon
      setLoading(true);

      // Get state forms for 21E and 64.21E
      const stateForms = await obtainStateForms({ forms: ["21E", "64.21E"] });

      // All possible age ranges for 21E and 64.21E
      const ageRanges = ["0000", "0001", "0105", "0612", "1318"];

      // Get answer entries from forms
      const answerEntries = await obtainAnswerEntriesFromForms({
        stateForms: stateForms.entries,
        ageRanges
      });

      // Write new totals
      const update = await generateEnrollmentTotals({
        answerEntries: answerEntries.countsToWrite
      });

      setLoading(false);
      setAlert(update);
    }
  };

  return (
    <div className="generate-totals-container">
      {loading ? (
        <div className="loader">
          <div className="loader-content">
            <div className="loader-icon"></div>Generating New Enrollment Counts
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {alert && alert.status === 200 ? (
        <Alert className="margin-bottom-3" type="success">
          {alert.message}
        </Alert>
      ) : null}
      {alert && (alert.status === 500 || alert.status === 409) ? (
        <Alert className="margin-bottom-3" type="error">
          {alert.message}
        </Alert>
      ) : null}

      <p className="margin-bottom-3">
        The CARTS system pulls live data from SEDS. This option allows for the
        creation/replacement of compiled totals for Separate and Expansion CHIP
        based on question 7 of forms 21E and 64.21E.
      </p>

      <Button
        type="button"
        data-testid="generateTotalsButton"
        onClick={() => handleSubmit()}
        className="margin-bottom-5"
      >
        Generate Enrollment Totals
      </Button>
    </div>
  );
};

export default GenerateTotals;
