import React, { useState } from "react";
import { Alert, Button } from "@trussworks/react-uswds";
import Dropdown from "react-dropdown";
import { generateMissingForms } from "../../libs/api";

const GenerateMissingForms = () => {
  const [alert, setAlert] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState();
  const [successfulForms, setSuccessfulForms] = useState();
  const [failedForms, setFailedForms] = useState();

  const quarterSelections = [
    { label: "Q1", value: 1 },
    { label: "Q2", value: 2 },
    { label: "Q3", value: 3 },
    { label: "Q4", value: 4 }
  ];

  const createMissingForms = async () => {
    // trigger function for generating missing forms
    const currentYear = new Date().getFullYear();

    const data = { year: currentYear, quarter: selectedQuarter };
    const res = await generateMissingForms(data);

    // SET SUCCESSFULLY GENERATED FORMS TO STATE, setSuccesfulForms
    // SET ANY FAILED FORMS TO STATE, setFailedForms

    setLoading(false);

    // Set no matter what, show failures
    // Alert message should be "all missing forms generated successfully"
    // or "x forms were created successfully y forms failed to generate"
    setAlert(res);
  };

  return (
    <div className="generate-forms-container">
      {loading ? (
        <div className="loader">
          <div className="loader-content">
            <div className="loader-icon"></div>Generating missing forms
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
        Temporary page for generating missing forms
      </p>

      <p>Select the CURRENT Quarter</p>
      <Dropdown
        options={quarterSelections}
        onChange={e => setSelectedQuarter(e)}
        value={selectedQuarter ?? ""}
        placeholder="Select the current quarter"
        autosize={false}
        className="margin-bottom-2"
      />

      <Button
        type="button"
        onClick={() => createMissingForms()}
        className="margin-bottom-5"
      >
        Find Missing Forms
      </Button>
    </div>
  );
};

export default GenerateMissingForms;
