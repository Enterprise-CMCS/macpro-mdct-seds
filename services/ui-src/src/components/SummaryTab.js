import React from "react";
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
        let tabAnswers;

        // Create array of tab IDs
        let tabArray = [];
        for (let tab in tabs) {
          tabArray.push(tabs[tab].range_id);
        }

        // Find all questions that match questionID
        const jpexpr = `$..[?(@.question==='${questionID}')]`;
        const allAnswers = jsonpath.query(answers, jpexpr);

        // All rows in one array (all answers for a specific question)
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
              newRows.push(column);
            } else {
              // If exists, add values where applicable
              for (let k in column) {
                let currentColumn = column[k];

                // If null change to zero
                if (currentColumn === null) {
                  currentColumn = 0;
                }

                // If not a number, copy it wholesale, else add together
                if (isNaN(currentColumn)) {
                  newRows[key][k] = currentColumn;
                } else if (currentColumn === "") {
                  newRows[key][k] = "";
                } else {
                  newRows[key][k] += parseFloat(currentColumn);
                }
              }
            }
          }
        }

        // Create age range and tab answers
        tabs.map((tab, idx) => {
          // Extract the range ID and filter the array of form answers by tab
          tabAnswers = answers.filter(element => element.rangeId === tab);
        });

        // Find the first question that has the same QuestionID
        // This is for a sample question that will have its rows replaced by newRows
        const questionAnswer = tabAnswers.find(
          element => element.question === questionID
        );

        // let questionAnswer = {
        //   age_range: "Summary",
        //   rangeId: "0000",
        //   question: "2021-21E-01",
        //   state_form: "AL-2021-1-21E",
        //   last_modified_by: "seed",
        //   created_date: "01/15/2021",
        //   last_modified: "01/15/2021",
        //   created_by: "seed",
        //   answer_entry: "AL-2021-1-21E-1318-01"
        // };

        let a = 0;

        // Set rows for the question
        questionAnswer.rows = newRows;
        let b = 0;
        return (
          <QuestionComponent
            key={idx}
            rangeID={"summary"}
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
  tabs: state.currentForm.tabs
});

export default connect(mapState)(SummaryTab);
