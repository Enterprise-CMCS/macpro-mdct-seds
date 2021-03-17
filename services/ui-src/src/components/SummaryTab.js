import React from "react";
import { TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import QuestionComponent from "./Question";
import jsonpath from "jsonpath";
import { connect } from "react-redux";

const SummaryTab = ({ questions, tabs, answers }) => {

  return (
      <>
        <h3>Summary:</h3>

        {questions.map((singleQuestion, idx) => {
          // Extract the ID from each question and find its corresponding answer object
          const questionID = singleQuestion.question;

          let newRows = [];
          let ageRangeID;
          let tabAnswers;
          tabs.map((tab, idx) => {
            // Extract the range ID and filter the array of form answers by tab
            ageRangeID = tab.range_id;
            tabAnswers = answers.filter(
                element => element.rangeId === ageRangeID
            );
          });

          // Create array of tab IDs
          let tabArray = [];
          for (let tab in tabs) {
            tabArray.push(tabs[tab].range_id);
          }
          let v = 0;
          const questionAnswer = tabAnswers.find(
              element => element.question === questionID
          );

          // Find all questions that match questionID
          const jpexpr = `$..[?(@.question==='${questionID}')]`;
          const allAnswers = jsonpath.query(answers, jpexpr);
          const a = 0;

          // All rows in one array
          const allTabs = [];
          for (let answer in allAnswers) {
            allTabs.push(allAnswers[answer].rows);
          }



          // Loop through all tabs
          for (let tabKey in allTabs) {
            let row = allTabs[tabKey];

            // Loop through all rows
            for (let key in row) {
              let column = row[key];

              // If key doesn't exist, add entire row
              if (!newRows.hasOwnProperty(key)) {

                // Convert null to zero
                for (let c in column) {
                  if (column[c] === null) {
                    column[c] = 0;
                  }
                }
                newRows.push(column);
              } else {
                // If exists, add values where applicable
                for (let k in column) {
                  let a = column[k];

                  // If null change to zero
                  if (column[k] === null) {
                    column[k] = 0;
                  }

                  // If not a number, copy it wholesale, else add together
                  if(isNaN(column[k])) {
                    newRows[key][k] = column[k];
                  } else if (column[k] === "") {
                    newRows[key][k] = "";
                  }
                  else {
                    let a = newRows[key][column[k]];
                    let b = column[k]
                    let c;
                    newRows[key][k] += parseFloat(column[k]);
                  }
                }
              }
            }
          }

          questionAnswer['rows'] = newRows;

          const objKeys = 0;

          return (
              <QuestionComponent
                  key={idx}
                  rangeID={ageRangeID}
                  questionData={singleQuestion}
                  answerData={questionAnswer}
                  disabled={true}
              />
          );
        })}
      </>
  );
};

const mapState = state => ({
  answers: state.currentForm.answers,
  questions: state.currentForm.questions,
  tabs: state.global.age_ranges
});

export default connect(mapState)(SummaryTab);
