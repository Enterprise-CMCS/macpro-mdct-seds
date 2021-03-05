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
            <div className="age-range-description">
              <h3>{tab.age_description}:</h3>
            </div>

            {questions.map((question, idx) => {
              return (
                <QuestionComponent
                  rangeID={tab.range_id}
                  singleQuestion={question}
                  questionNumberByIndex={idx}
                />
              );
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

export default connect(mapState)(TabContainer);

// will i ahve to put backup ternary [] for questions??
