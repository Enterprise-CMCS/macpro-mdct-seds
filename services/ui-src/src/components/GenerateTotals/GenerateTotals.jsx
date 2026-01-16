import React, { useState } from "react";
import { Alert, Button } from "@trussworks/react-uswds";

import { generateEnrollmentTotals } from "../../libs/api";
import "./GenerateTotals.scss";

const GenerateTotals = () => {
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    const proceed = window.confirm(
      "You are about to create new Enrollment Totals. This action cannot be undone. Do you wish to proceed?"
    );

    if (proceed) {
      // Start loading icon
      setLoading(true);

      await generateEnrollmentTotals(); // Async request, just returns an immediate 200 and starts processing.

      setLoading(false);
      setAlert(true);
    }
  };

  return (
    <div className="generate-totals-container">
      <h1 className="page-header">Generate Total Enrollment Counts</h1>
      {loading ? (
        <div className="loader">
          <div className="loader-content">
            <div className="loader-icon"></div>Generating New Enrollment Counts
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {alert && (
        <Alert className="margin-bottom-3" type="success" headingLevel="h1">
          Enrollment Totals have been requested! Please wait at least 1 minute
          for the data to reflect this update.
        </Alert>
      )}

      <p className="margin-bottom-4">
        The CARTS system pulls live data from SEDS. This option allows for the
        creation/replacement of compiled totals for Separate and Expansion CHIP
        based on question 7 of forms 21E and 64.21E.
      </p>

      <Button
        type="button"
        data-testid="generateTotalsButton"
        onClick={() => handleSubmit()}
      >
        Generate Enrollment Totals
      </Button>
    </div>
  );
};

export default GenerateTotals;
