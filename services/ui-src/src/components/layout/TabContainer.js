import React from "react";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import {
  Accordion,
  Alert,
  Button,
  Grid,
  GridContainer
} from "@trussworks/react-uswds";

const TabContainer = () => {
  let tabName;
  return (
    <GridContainer className="tab-container">
      <Grid row>
        <Grid col={12}>
          <Tabs>
            <TabList>
              {fakeTabData.map((tab, idx) => {
                return <Tab key={idx}>{tab.age_range}</Tab>;
              })}
              <Tab>Summary</Tab>
              <Tab>Certification</Tab>
            </TabList>

            {fakeTabData.map((tab, idx) => {
              // The questions for each tab will go inside of the tab Panels
              return <TabPanel key={idx}>{tab.age_description}</TabPanel>;
            })}

            <TabPanel>Summary </TabPanel>
            <TabPanel>Certification</TabPanel>
          </Tabs>
        </Grid>
      </Grid>
    </GridContainer>
  );
};
// The actual questions will go inside of the tab panels, find a way to componenetize that

const fakeTabData = [
  {
    age_range: "Under Age 0",
    age_description: "Conception to birth"
  },
  {
    age_range: "Ages 0 - 1",
    age_description: "Birth through age 12 months"
  },
  {
    age_range: "Ages 1 - 5",
    age_description: "Age 1 year through age 5 years"
  },
  {
    age_range: "Ages 6 - 12",
    age_description: "Age 6 years through age 12 years"
  },
  {
    age_range: "Ages 13 - 18",
    age_description: "Age 13 years through age 18 years"
  }
];

export default TabContainer;
