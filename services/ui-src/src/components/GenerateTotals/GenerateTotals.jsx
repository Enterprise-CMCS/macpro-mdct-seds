import React, { useState } from "react";
import { Button, Alert } from "@cmsgov/design-system";

import { generateEnrollmentTotals } from "../../libs/api";

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
    <div className="flex-col-gap-1half half-width">
      <h1>Generate Total Enrollment Counts</h1>
      {loading ? (
        <div>
          <div>
            <div></div>Generating New Enrollment Counts
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {alert && (
        <Alert variation="success" headingLevel="1">
          Enrollment Totals have been requested! Please wait at least 1 minute
          for the data to reflect this update.
        </Alert>
      )}

      <p>
        The CARTS system pulls live data from SEDS. This option allows for the
        creation/replacement of compiled totals for Separate and Expansion CHIP
        based on question 7 of forms 21E and 64.21E.
      </p>

      <Button
        variation="solid"
        data-testid="generateTotalsButton"
        onClick={() => handleSubmit()}
      >
        Generate Enrollment Totals
      </Button>
    </div>
  );
};

export default GenerateTotals;
