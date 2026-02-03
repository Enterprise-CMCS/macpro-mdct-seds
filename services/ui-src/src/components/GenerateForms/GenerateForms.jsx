import React, { useState } from "react";
import { Button, Alert } from "@cmsgov/design-system";
import { generateQuarterlyForms } from "../../libs/api";

const GenerateForms = () => {
  const [selectedYear, setSelectedYear] = useState("2019");
  const [selectedQuarter, setSelectedQuarter] = useState("1");
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
      setAlert(undefined);
      try {
        await generateQuarterlyForms({
          year: Number(selectedYear),
          quarter: Number(selectedQuarter),
        });
        setAlert({ type: "success", message: "Form creation successful." });
      } catch (err) {
        const message =
          err instanceof Error
            ? `Form creation failed: ${err.message}`
            : "Form creation failed.";
        setAlert({ type: "error", message });
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="flex-col-gap-1half half-width">
      {loading ? (
        <div>
          <div>
            <div></div>Generating new forms
            <br /> Please Wait...
          </div>
        </div>
      ) : null}
      {alert ? (
        <Alert variation={alert.type} headingLevel="h1">
          {alert.message}
        </Alert>
      ) : null}
      <h1>Generate Quarterly Forms</h1>
      <p>
        Create new forms for each state by filling out the form below. Please
        select the year and quarter you wish to create form template from.
      </p>
      <div>
        <label htmlFor="year-select">Select the Year</label>
        <select
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
      </div>
      <div>
        <label htmlFor="quarter-select" style={{ marginTop: "0.5rem" }}>
          Select the Quarter
        </label>
        <select
          id="quarter-select"
          value={selectedQuarter}
          onChange={(evt) => setSelectedQuarter(evt.target.value)}
        >
          <option value="1">Q1</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>
      </div>
      <Button
        variation="solid"
        data-testid="generateFormsButton"
        className="flex-end"
        onClick={() => generateForms()}
      >
        Generate Forms
      </Button>
    </div>
  );
};

export default GenerateForms;
