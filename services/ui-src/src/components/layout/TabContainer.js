import React from "react";

import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const TabContainer = () => {
  return (
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
        return (
          <TabPanel key={idx}>
            <b>{tab.age_description}:</b>{" "}
            {<p>{loremIpsum} This is where the questions will go! </p>}
          </TabPanel>
        );
      })}

      <TabPanel>
        <b>Summary:</b> {<p>{loremIpsum}</p>}
      </TabPanel>
      <TabPanel>
        <b>Certification:</b> {<p>{loremIpsum}</p>}
      </TabPanel>
    </Tabs>
  );
};

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

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export default TabContainer;
