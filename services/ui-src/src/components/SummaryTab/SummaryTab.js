import React from "react";
import "react-tabs/style/react-tabs.css";
import QuestionComponent from "../Question/Question";
import jsonpath from "jsonpath";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import SummaryNotes from "../SummaryNotes/SummaryNotes";

const SummaryTab = ({ questions, answers }) => {
  return (
    <div className="summary-tab">
      <h3>Summary:</h3>

      {questions.map((singleQuestion, idx) => {
        // Initialize newRows
        let newRows = [];

        // Extract the question ID
        const questionID = singleQuestion.question;

        // Find all questions that match questionID
        const jpexpr = `$..[?(@.question==='${questionID}')]`;
        const allAnswersTemp = jsonpath.query(answers, jpexpr);

        // Make a deep copy of answers to prevent overwriting data
        let allAnswers = JSON.parse(JSON.stringify(allAnswersTemp));

        // Put all rows in one array (all answers for the current question)
        // This is to decrease the complexity of later loops
        let allTabs = allAnswers.map(a => a.rows);

        // Loop through all tabs array
        for (let singleTab of allTabs) {
          let row = singleTab;

          // Loop through all rows in the current tab (allTabs)
          for (let rowKey in row) {
            // Set to variable to avoid reference issues
            let column = row[rowKey];

            // If key doesn't exist, add entire row
            if (!Object.prototype.hasOwnProperty.call(newRows, rowKey)) {
              newRows.push(column);
            } else {
              // If exists, add values where applicable
              for (let columnKey in column) {
                let currentColumn = column[columnKey];

                // If null change to zero
                currentColumn = currentColumn === null ? 0 : currentColumn;

                // If not a number, copy it wholesale, else add together
                if (isNaN(currentColumn)) {
                  newRows[rowKey][columnKey] = currentColumn;
                } else if (currentColumn === "") {
                  // If empty string, return an empty string
                  newRows[rowKey][columnKey] = "";
                } else {
                  // Add value to current value
                  newRows[rowKey][columnKey] += parseFloat(currentColumn);
                }
              }
            }
          }
        }

        // Find the first question that has the same QuestionID
        // This is for a sample question that will have its rows replaced by newRows
        const questionAnswer = questions.find(
          element => element.question === questionID
        );

        // Set rows for the question
        questionAnswer.rows = newRows;

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
      <SummaryNotes />
    </div>
  );
};

SummaryTab.propTypes = {
  questions: PropTypes.array.isRequired,
  answers: PropTypes.array.isRequired
};

const mapState = state => ({
  answers: state.currentForm.answers,
  questions: state.currentForm.questions
});

export default connect(mapState)(SummaryTab);
