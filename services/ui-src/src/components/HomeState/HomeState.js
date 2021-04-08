import React, { useEffect, useState } from "react";
import { Accordion, Grid, Link } from "@trussworks/react-uswds";
import { obtainUserByEmail, obtainAvailableForms } from "../../libs/api";
import { Auth } from "aws-amplify";

const HomeState = () => {
  // Set up local state
  const [state, setState] = useState();
  const [formData, setFormData] = useState();

  // Get User data
  const loadUserData = async () => {
    // Get user data via email from amplify
    const AuthUserInfo = await Auth.currentAuthenticatedUser();
    const currentUserInfo = await obtainUserByEmail({
      email: AuthUserInfo.attributes.email
    });

    // Set temporary state ONLY for debugging
    currentUserInfo.Items[0].states = ["MD"];

    // Save to local state
    setState(currentUserInfo.Items[0].states[0]);

    // Get list of all state forms
    const forms = await obtainAvailableForms({
      stateId: currentUserInfo.Items[0].states[0]
    });

    // Sort forms descending by year and then quarter
    forms.sort(function (a, b) {
      if (a.year === b.year) {
        return a.quarter - b.quarter;
      } else if (a.year < b.year) {
        return 1;
      } else if (a.year > b.year) {
        return -1;
      }
      return false;
    });

    setFormData(forms);
  };
  useEffect(() => {
    loadUserData();
  }, []);

  let uniqueYears;
  if (formData) {
    uniqueYears = Array.from(new Set(formData.map(a => a.year))).map(year => {
      return formData.find(a => a.year === year);
    });
  }

  let accordionItems = [];

  for (const year in uniqueYears) {
    let quarters = [];

    // Loop through all formData and get quarters
    for (const form in formData) {
      // If years match, add quarter to array
      if (formData[form].year === uniqueYears[year].year) {
        quarters.push(formData[form]);
      }
    }

    // Remove duplicate quarters
    let uniqueQuarters;
    if (quarters) {
      uniqueQuarters = Array.from(new Set(quarters.map(a => a.quarter))).map(
        quarter => {
          return quarters.find(a => a.quarter === quarter);
        }
      );
    }

    // Build output for each accordion item
    let quartersOutput = (
      <ul className="quarterly-items">
        {uniqueQuarters.map(element => {
          return (
            <li key={`${element.quarter}`}>
              <Link
                href={`/#/forms/${state}/${uniqueYears[year].year}/${element.quarter}`}
              >
                Quarter {`${element.quarter}`}
              </Link>
            </li>
          );
        })}
      </ul>
    );

    // If current year, set expanded to true
    let expanded = true;
    let currentDate = new Date();
    if (uniqueYears[year].year === currentDate.getFullYear()) {
      expanded = true;
    }

    // Build single item
    let item = {
      id: uniqueYears[year].year,
      description: "Quarters for " + uniqueYears[year].year,
      title: uniqueYears[year].year,
      content: quartersOutput,
      expanded: true
    };

    accordionItems.push(item);
  }

  return (
    <Grid row className="page-home-state">
      <Grid col={12}>
        <p>
          Welcome to SEDS! Please select a Federal Fiscal Year and quarter below
          to view available reports.
        </p>
        <div className="quarterly-report-list">
          <Accordion bordered={true} items={accordionItems} />
        </div>
      </Grid>
    </Grid>
  );
};

export default HomeState;
