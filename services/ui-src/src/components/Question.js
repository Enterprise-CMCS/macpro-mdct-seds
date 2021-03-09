import React from "react";
import PropTypes from "prop-types";
import GridWithTotals from "../components/GridWithTotals/GridWithTotals";
import { sortQuestionColumns } from "../utilityFunctions/sortingFunctions";

const QuestionComponent = ({ questionData, rangeID, answerData, disabled }) => {
  // Get the question ID and label from the question
  const { label, question } = questionData;
  // Get the rows from the answers table
  const { rows, answer_entry } = answerData;

  const questionNumber = Number.parseInt(question.split("-").slice(-1));

  // Turn the age range into a grammatically correct variable in the label
  const ageVariable = questionVariables[rangeID];
  const labelWithAgeVariable = label.replace("&&&VARIABLE&&&", ageVariable);

  // The array of rows is unordered by default. GridWithTotals requires it being ordered
  const sortedRows = rows.map(rowObject => sortQuestionColumns(rowObject));

  return (
    <>
      <b>
        {questionNumber}. {labelWithAgeVariable}
      </b>
      {questionNumber !== 5 ? (
        <GridWithTotals
          questionID={answer_entry}
          gridData={sortedRows}
          disabled={disabled}
        />
      ) : (
        <p>
          Question five requires special logic. There is a separate ticket for
          it{" "}
        </p>
      )}
    </>
  );
};

// QuestionComponent.propTypes = {
//   disabled: PropTypes.bool.isRequired,
//   statusData: PropTypes.object.isRequired,
//   getForm: PropTypes.func.isRequired
// };

export default QuestionComponent;

// NOTE: If the range_id's change, they will need to change here as well
const questionVariables = {
  "0000": "Under Age 0",
  "0001": "between the ages of 0 and 1",
  "0105": "between the ages of 1 and 5",
  "0612": "between the ages of 6 and 12",
  1318: "Between the ages of 13 and 18"
};
