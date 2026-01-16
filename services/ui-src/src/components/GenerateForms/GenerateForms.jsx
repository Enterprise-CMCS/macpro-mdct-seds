import React, { useState } from "react";
import { Button, Alert } from "@cmsgov/design-system";
import { generateQuarterlyForms } from "../../libs/api";
import "./GenerateForms.scss";

const GenerateForms = () => {
  const [selectedYear, setSelectedYear] = useState();
  const [selectedQuarter, setSelectedQuarter] = useState();
  const [alert, setAlert] = useState();
  const [loading, setLoading] = useState(false);

  // Build options for year dropdown. From 2019 until next year, inclusive.
  const firstYear = 2019;
  const nextYear = new Date().getFullYear() + 1;
  const yearSelections = [...new Array(nextYear - firstYear + 1)]
    .map((_, i) => (i + 2019).toString())
    .map((year) => ({ label: year, value: year }));

  // Handle click event and trigger
  const generateForms = async () => {
    if (!selectedYear || !selectedQuarter) {
      window.alert("Please select a Year and Quarter");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to generate forms for Quarter Q${selectedQuarter} of ${selectedYear}. This action cannot be undone.`
      )
    ) {
      // send year and quarter to lambda which will create the table rows
      setLoading(true);
      const response = await generateQuarterlyForms({
        year: Number(selectedYear),
        quarter: Number(selectedQuarter),
      });
      setLoading(false);
      setAlert(response);
    }
  };
  return (
    <div className="generate-forms-container">
      {loading ? (
        <div className="loader">
          <div className="loader-content">
            <div className="loader-icon"></div>Generating new forms
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {alert && alert.status === 200 ? (
        <Alert
          variation="success"
          className="margin-bottom-3"
          headingLevel="h1"
        >
          {alert.message}
        </Alert>
      ) : null}

      {alert && alert.status === 204 ? (
        <Alert variation="warn" className="margin-bottom-3" headingLevel="h1">
          {alert.message}
        </Alert>
      ) : null}

      {alert && (alert.status === 500 || alert.status === 409) ? (
        <Alert variation="error" className="margin-bottom-3" headingLevel="h1">
          {alert.message}
        </Alert>
      ) : null}
      <h1 className="page-header">Generate Quarterly Forms</h1>
      <p className="margin-bottom-4">
        Create new forms for each state by filling out the form below. Please
        select the year and quarter you wish to create form template from.
      </p>
      <label htmlFor="year-select">Select the Year</label>
      <select
        className="usa-select"
        id="year-select"
        value={selectedYear}
        onChange={(evt) => setSelectedYear(evt.target.value)}
      >
        {yearSelections.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label htmlFor="quarter-select" style={{ marginTop: "0.5rem" }}>
        Select the Quarter
      </label>
      <select
        className="usa-select"
        id="quarter-select"
        value={selectedQuarter}
        onChange={(evt) => setSelectedQuarter(evt.target.value)}
      >
        <option value="1">Q1</option>
        <option value="2">Q2</option>
        <option value="3">Q3</option>
        <option value="4">Q4</option>
      </select>
      <Button
        variation="solid"
        style={{ marginTop: "0.5rem" }}
        data-testid="generateFormsButton"
        onClick={() => generateForms()}
        className="margin-bottom-5"
      >
        Generate Forms
      </Button>
    </div>
  );
};

export default GenerateForms;
