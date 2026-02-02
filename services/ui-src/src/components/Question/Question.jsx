import React from "react";
import PropTypes from "prop-types";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import SynthesizedGrid from "../SynthesizedGrid/SynthesizedGrid";
import GREGridWithTotals from "../GREGridWithTotals/GREGridWithTotals";
import {
  sortQuestionColumns,
  sortByCol1,
} from "../../utility-functions/sortingFunctions";

const QuestionComponent = ({
  questionData,
  rangeID,
  answerData,
  disabled,
  synthesized,
}) => {
  // Get the question ID, label and question type from the question
  const { label, question, type } = questionData;
  // Get the rows from the answers table

  // If GRE form, sort the answers by col1 (row label)
  if (answerData.question.split("-")[1] === "GRE") {
    answerData.rows = answerData.rows.sort(sortByCol1);
  }
  const { rows, answer_entry } = answerData || {};

  if (!rows) {
    return null;
  }

  const questionNumber = parseInt(question.split("-").slice(-1));
  const questionType = type;

  // Turn the age range into a grammatically correct variable in the label
  const ageVariable = questionVariables[rangeID];
  const labelWithAgeVariable = label.replace(
    "&&&VARIABLE&&&",
    ageVariable ?? ""
  );

  // The array of rows is unordered by default. GridWithTotals requires it being ordered
  const sortedRows = sortQuestionColumns(rows);

  // *** question component will be determined on the fly
  let questionComponent = {};

  if (sortedRows.length > 0 && questionNumber > 0) {
    // *** question 5 is special
    if (questionNumber === 5) {
      // *** and as such, will require a synthesized grid
      questionComponent = (
        <SynthesizedGrid
          questionID={answer_entry}
          gridData={sortedRows}
          range={answerData.rangeId}
        />
      );
    }
    // *** all other questions will be treated according to type
    else {
      switch (questionType) {
        // *** grid with totals
        case "datagridwithtotals":
          questionComponent = (
            <GridWithTotals
              questionID={answer_entry}
              gridData={sortedRows}
              disabled={disabled}
              synthesized={synthesized ? synthesized : false}
            />
          );
          break;
        // *** gre grid with totals
        case "gregridwithtotals":
          questionComponent = (
            <GREGridWithTotals
              questionID={answer_entry}
              gridData={sortedRows}
              disabled={disabled}
            />
          );
          break;

        default:
          break;
      }
    }
  }
  return (
    <div>
      <b>
        {questionNumber}. {labelWithAgeVariable}
      </b>
      {questionComponent}
    </div>
  );
};
QuestionComponent.propTypes = {
  questionData: PropTypes.object.isRequired,
  rangeID: PropTypes.string.isRequired,
  answerData: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  synthesized: PropTypes.bool,
};

export default QuestionComponent;

// NOTE: If the range_id's change, they will need to change here as well
const questionVariables = {
  "0000": "Under Age 0",
  "0001": "between the ages of 0 and 1",
  "0105": "between the ages of 1 and 5",
  "0612": "between the ages of 6 and 12",
  1318: "between the ages of 13 and 18",
  1920: "between the ages of 19 and 20",
};
