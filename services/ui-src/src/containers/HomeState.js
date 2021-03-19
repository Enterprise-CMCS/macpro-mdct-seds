import React from "react";
import { Accordion, Grid, Link } from "@trussworks/react-uswds";

const HomeState = ({ states }) => {
  // Pull state from redux
  const state = states;
  // TODO: Pull years and quarters
  // define years and months
  const date = new Date();
  let fiscalYear = date.getFullYear();
  let month = date.getMonth() + 1;
  // create array years with subarrays year and quarters
  // const years = [...year, ...quarters];
  const years = [];
  // for loops to populate subarrays
  function dateMachine(fiscalYear, month) {
    for (let i = fiscalYear; i >= 2018; i--) {
      let currentYear;
      let currentQuarters;

      if (i === fiscalYear) {
        currentYear = fiscalYear;
        if (month > 9) {
          currentYear = fiscalYear + 1;
          currentQuarters = [1];
        } else if (month < 4) {
          currentQuarters = [1, 2];
        } else if (month > 3 && month < 7) {
          currentQuarters = [1, 2, 3];
        } else {
          currentQuarters = [1, 2, 3, 4];
        }
        years.push({
          year: currentYear,
          quarters: currentQuarters
        });
      } else {
        years.push({
          year: i,
          quarters: [1, 2, 3, 4]
        });
      }
    }
    return years;
  }

  const test = dateMachine(fiscalYear, month);
  console.log("dateMachine output", test);
  let accordionItems = [];
  for (const year in years) {
    // Build node with link to each quarters reports
    
    let quarters = (
      <ul className="quarterly-items">
        {years[year].quarters.map(element => {
          return (
            <li key={`${state}-${years[year].year}-${element}`}>
              <Link href={`/forms/${state}/${years[year].year}/${element}`}>
                Quarter {element}
              </Link>
            </li>
          );
        })}
      </ul>
    );
    // If current year, set expanded to true
    let expanded = false;
    if (years[year].year === date.getFullYear()) {
      expanded = true;
    }
    // Build single item
    let item = {
      id: years[year].year,
      description: "Quarters for " + years[year].year,
      title: years[year].year,
      content: quarters,
      expanded: expanded
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

export default HomeState({states});
