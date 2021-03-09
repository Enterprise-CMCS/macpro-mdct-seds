import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import CertificationTab from "../CertificationTab";
import SummaryTab from "../SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question";

const TabContainer = ({ tabs, questions, answers }) => {
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
        // Extract the range ID and filter the array of form answers by tab
        const ageRangeID = tab.range_id;
        const tabAnswers = answers.filter(
          element => element.rangeId === ageRangeID
        );

        return (
          <TabPanel key={idx}>
            <div className="age-range-description">
              <h3>{tab.age_description}:</h3>
            </div>

            {questions.map(singleQuestion => {
              // Extract the ID from each question and find its corresponding answer object
              const questionID = singleQuestion.question;
              const questionAnswer = tabAnswers.find(
                element => element.question === questionID
              );

              return (
                <QuestionComponent
                  rangeID={tab.range_id}
                  questionData={singleQuestion}
                  answerData={questionAnswer}
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
  tabs: PropTypes.array.isRequired,
  questions: PropTypes.array.isRequired
};

const mapState = state => ({
  tabs: state.global.age_ranges,
  questions: state.currentForm.questions,
  answers: state.currentForm.answers
});

export default connect(mapState)(TabContainer);

// will i ahve to put backup ternary [] for questions??

// TODO ALEXIS:
// REMOVE REDUX
// needs all questions
// needs age ranges
