import React from "react";
import { connect } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import CertificationTab from "../CertificationTab";
import SummaryTab from "../SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question";

const TabContainer = ({ tabs, questions }) => {
  return (
    <Tabs>
      <TabList>
        {tabs.map((tab, idx) => {
          return <Tab key={idx}>{tab.age_range}</Tab>;
        })}
        <Tab>Summary</Tab>
        <Tab>Certification</Tab>
      </TabList>

      {tabs.map((tab, idx) => {
        // The questions for each tab will go inside of the tab Panels
        return (
          <TabPanel key={idx}>
            <b>{tab.age_description}:</b>

            {questions.map(question => {
              return <QuestionComponent singleQuestion={question} />;
            })}
          </TabPanel>
        );
      })}

      <TabPanel>
        <SummaryTab />
      </TabPanel>
      <TabPanel>
        <CertificationTab />
      </TabPanel>
    </Tabs>
  );
};

TabContainer.propTypes = {
  tabs: PropTypes.array.isRequired
};

const mapState = state => ({
  tabs: state.global.age_ranges,
  questions: state.currentForm.questions
});

const loremIpsum =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export default connect(mapState)(TabContainer);
