import React from "react";
import { Grid } from "@trussworks/react-uswds";

const Quarterly = () => {
  // TODO: Build title from JSON
  const title = "Q4 2020 Reports";

  // TODO: Pull data from API endpoint
  const data = {
    2020: [
      {
        Q1: [
          {
            form: "Form 64-EC",
            name: "Number of Children Served in Medicaid Program",
            status: "complete",
            last_updated: ""
          },
          {
            form: "Form 64-ECI",
            name: "Informational Number of Children Served in Medicaid Program",
            status: "provisional",
            last_updated: ""
          },
          {
            form: "Form 64-21E",
            name: "Informational Number of Children Served in Medicaid Program",
            status: "final",
            last_updated: ""
          },
          {
            form: "Form 64-21EI",
            name:
              "Informational Number of Children Served in Medicaid Expansion Program",
            status: "nost_started",
            last_updated: ""
          },
          {
            form: "Form 21E",
            name: "Number of Children Served in Medicaid Program",
            status: "provisional",
            last_updated: ""
          }
        ]
      }
    ]
  };

  return (
    <Grid row className="page-home-state">
      <Grid col={12}>
        <h1>{title}</h1>
      </Grid>
    </Grid>
  );
};

export default Quarterly;
