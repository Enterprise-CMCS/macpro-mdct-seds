import React from "react";
import { Accordion, Grid, Link } from "@trussworks/react-uswds";

const HomeState = () => {
  // TODO: Pull state from redux
  const state = "AK";

  // TODO: Pull years and quarters from redux
  const years = [
    {
      year: 2021,
      quarters: ["1", "2"]
    },
    {
      year: 2020,
      quarters: ["1", "2", "3", "4"]
    },
    {
      year: 2019,
      quarters: ["1", "2", "3", "4"]
    },
    {
      year: 2018,
      quarters: ["1", "2", "3", "4"]
    }
  ];

  let accordionItems = [];
  for (const year in years) {
    // Build node with link to each quarters reports
    let quarters = (
      <ul>
        {years[year].quarters.map(element => {
          return (
            <li>
              <Link href={`/forms/${state}/${years[year].year}/${element}`}>
                Quarter {element}
              </Link>
            </li>
          );
        })}
      </ul>
    );

    // Determine if item is in current year
    let expanded = false;

    const date = new Date();
    if (years[year].year === date.getFullYear()) {
      expanded = true;
    }

    let item = {
      id: year,
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
        <h2>Enrollment Data</h2>
        <p>
          Welcome to SEDS. Please select a Federal fiscal year and quarter to
          view available reports.
        </p>
        <Accordion bordered={true} items={accordionItems} />
      </Grid>
    </Grid>
  );
};

export default HomeState;
