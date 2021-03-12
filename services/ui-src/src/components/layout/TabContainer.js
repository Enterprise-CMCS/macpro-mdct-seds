import React from "react";
import { connect } from "react-redux";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import CertificationTab from "../CertificationTab";
import SummaryTab from "../SummaryTab";
import PropTypes from "prop-types";
import QuestionComponent from "../Question";

const TabContainer = ({ tabs, questions, answers, disabled, quarter }) => {
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

            {questions.map((singleQuestion, idx) => {
              // Extract the ID from each question and find its corresponding answer object
              const questionID = singleQuestion.question;
              console.log("questionID",questionID)
              console.log("singleQuestion",singleQuestion)
              const questionAnswer = tabAnswers.find(
                  element => element.question === questionID
              );

              let returnComponent = "";
              let activeContextData = false;
              let tempContextData = {};

              if (singleQuestion.context_data) {
                tempContextData = singleQuestion.context_data.show_if_quarter_in;
                activeContextData = true;
              }
              //Conditional display only works with single quarters and equals (so far)
              if (
                  activeContextData === false ||
                  (activeContextData && tempContextData === quarter)
              ) {
                  console.log("answerData", questionAnswer)
                returnComponent = (
                    <QuestionComponent
                        key={idx}
                        rangeID={tab.range_id}
                        questionData={singleQuestion}
                        answerData={questionAnswer}
                        disabled={disabled}
                    />
                );
              }
              return returnComponent;
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
  questions: PropTypes.array.isRequired,
  answers: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired
};

const mapState = state => ({
  disabled:
    state.currentForm.statusData.not_applicable ||
    state.currentForm.statusData.status === "final",
  tabs: state.global.age_ranges,
  questions: state.currentForm.questions,
  answers: state.currentForm.answers
});

export default connect(mapState)(TabContainer);
