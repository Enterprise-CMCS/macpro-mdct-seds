import GridWithTotals from "../components/GridWithTotals/GridWithTotals";
import React from "react";

const QuestionComponent = ({ singleQuestion, rangeID }) => {
  const { label, question, rows } = singleQuestion;

  const questionNumber = Number.parseInt(question.split("-").slice(-1));

  // Turn the age range into a grammatically correct variable
  const ageVariable = questionVariables[rangeID];
  const labelWithAgeVariable = label.replace("&&&VARIABLE&&&", ageVariable);

  return (
    <>
      <b>
        {questionNumber}. {labelWithAgeVariable}
      </b>
      {questionNumber !== 5 ? (
        <GridWithTotals gridData={rows} />
      ) : (
        <p>
          Question five requires special logic. There is a separate ticket for
          it{" "}
        </p>
      )}
    </>
  );
};

export default QuestionComponent;

// NOTE: If the range_id's change, they will need to change here as well
const questionVariables = {
  "0000": "Under Age 0",
  "0001": "between the ages of 0 and 1",
  "0105": "between the ages of 1 and 5",
  "0612": "between the ages of 6 and 12",
  1318: "Between the ages of 13 and 18"
};
