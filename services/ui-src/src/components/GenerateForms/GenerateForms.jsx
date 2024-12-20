import React, { useState } from "react";
import { Alert, Button } from "@trussworks/react-uswds";
import Dropdown from "react-dropdown";
import { generateQuarterlyForms } from "../../libs/api";
import "./GenerateForms.scss";

const GenerateForms = () => {
  const [selectedYear, setSelectedYear] = useState();
  const [selectedQuarter, setSelectedQuarter] = useState();
  const [alert, setAlert] = useState();
  const [loading, setLoading] = useState(false);

  const nextYear = new Date().getFullYear() + 1;

  // Build array for year dropdown
  const yearSelections = [];

  for (let i = 2019; i <= nextYear; i++) {
    yearSelections.push({ label: i, value: i });
  }

  // Build array for quarter dropdown
  const quarterSelections = [
    { label: "Q1", value: 1 },
    { label: "Q2", value: 2 },
    { label: "Q3", value: 3 },
    { label: "Q4", value: 4 }
  ];

  // Handle click event and trigger
  const generateForms = async () => {
    if (!selectedYear || !selectedQuarter) {
      window.alert("Please select a Year and Quarter");
      return;
    }
    if (
      window.confirm(
        `Are you sure you want to generate forms for Quarter ${selectedQuarter.value} of ${selectedYear.value}. This action cannot be undone.`
      )
    ) {
      // send year and quarter to lambda which will create the table rows
      setLoading(true);
      const data = { year: selectedYear.value, quarter: selectedQuarter.value };
      const response = await generateQuarterlyForms(data);
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
        <Alert className="margin-bottom-3" type="success" headingLevel="h1">
          {alert.message}
        </Alert>
      ) : null}

      {alert && alert.status === 204 ? (
        <Alert className="margin-bottom-3" type="warning" headingLevel="h1">
          {alert.message}
        </Alert>
      ) : null}

      {alert && (alert.status === 500 || alert.status === 409) ? (
        <Alert className="margin-bottom-3" type="error" headingLevel="h1">
          {alert.message}
        </Alert>
      ) : null}
      <h1 className="page-header">Generate Quarterly Forms</h1>
      <p className="margin-bottom-4">
        Create new forms for each state by filling out the form below. Please
        select the year and quarter you wish to create form template from.
      </p>
      <label for="select-year">Select the Year</label>
      <Dropdown
        options={yearSelections}
        onChange={e => setSelectedYear(e)}
        value={selectedYear ?? ""}
        placeholder="Select a Year"
        autosize={false}
        id="select-year"
        className="margin-bottom-4"
      />
      <label for="select-quarter">Select the Quarter</label>
      <Dropdown
        options={quarterSelections}
        onChange={e => setSelectedQuarter(e)}
        value={selectedQuarter ?? ""}
        placeholder="Select a Quarter"
        autosize={false}
        id="select-quarter"
        className="margin-bottom-4"
      />

      <Button
        type="button"
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
