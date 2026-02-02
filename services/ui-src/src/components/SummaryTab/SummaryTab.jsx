import React from "react";
import "react-tabs/style/react-tabs.css";
import QuestionComponent from "../Question/Question";
import SynthesizedGridSummary from "../SynthesizedGridSummary/SynthesizedGridSummary";
import jsonpath from "jsonpath";
import SummaryNotes from "../SummaryNotes/SummaryNotes";
import { useLocation } from "react-router-dom";
import { useStore } from "../../store/store";

const SummaryTab = () => {
  const questions = useStore((state) => state.questions);
  const answers = useStore((state) => state.answers);

  // Get current quarter from URL
  const location = useLocation();
  const quarter = location.pathname.split("/")[4];

  // Checks for non-numeric chars in a string
  function containsNonNumeric(value) {
    return /[^$,.\d]/.test(value);
  }

  return (
    <div>
      <div>
        <h3>Summary:</h3>
      </div>

      {questions.map((singleQuestion, idx) => {
        // Remove any questions that are hidden in this quarter
        if (
          singleQuestion.context_data &&
          !singleQuestion.context_data.show_if_quarter_in
            .toString()
            .includes(quarter)
        ) {
          return false;
        }

        // Initialize newRows
        let newRows = [];

        // Extract the question ID
        const questionID = singleQuestion.question;

        // Find all questions that match questionID
        const jpexpr = `$..[?(@.question==='${questionID}')]`;
        const allAnswersTemp = jsonpath.query(answers, jpexpr);

        const questionNumber = questionID.slice(-2);
        if (questionNumber === "05") {
          const rowsForGridData = allAnswersTemp[0];
          return (
            <SynthesizedGridSummary
              key={`synthesized-${questionNumber}`}
              allAnswers={answers}
              questions={questions}
              questionID={singleQuestion.question}
              gridData={rowsForGridData.rows}
              label={singleQuestion.label}
            />
          );
        } else {
          // Make a deep copy of answers to prevent overwriting data
          let allAnswers = JSON.parse(JSON.stringify(allAnswersTemp));

          // Put all rows in one array (all answers for the current question)
          // This is to decrease the complexity of later loops
          let allTabs = allAnswers.map((a) => a.rows);

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
                  if (containsNonNumeric(currentColumn)) {
                    newRows[rowKey][columnKey] = currentColumn;
                  } else if (currentColumn === "") {
                    // If empty string, return an empty string
                    newRows[rowKey][columnKey] = "";
                  } else {
                    let currentValue =
                      parseFloat(newRows[rowKey][columnKey]) || 0;
                    // Add value to current value
                    newRows[rowKey][columnKey] =
                      currentValue + parseFloat(currentColumn);
                  }
                }
              }
            }
          }

          // Find the first question that has the same QuestionID
          // This is for a sample question that will have its rows replaced by newRows
          const questionAnswer = questions.find(
            (element) => element.question === questionID
          );

          // Set rows for the question
          questionAnswer.rows = newRows;

          return (
            <QuestionComponent
              questionID={`summary-${questionID}`}
              key={idx}
              rangeID={"summary"}
              questionData={singleQuestion}
              answerData={questionAnswer}
              disabled={true}
              synthesized={true}
            />
          );
        }
      })}
      <SummaryNotes />
    </div>
  );
};

export default SummaryTab;
