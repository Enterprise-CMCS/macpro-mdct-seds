import GridWithTotals from "../components/GridWithTotals/GridWithTotals";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

// ONE QUESTION
const QuestionComponent = ({
  singleQuestion,
  rangeID,
  questionNumberByIndex
}) => {
  const { label, rows, context_data, form, type } = singleQuestion;

  const questionNumber = questionNumberByIndex + 1;

  const ageVariable = questionVariables[rangeID];
  const labelWithAgeVariable = label.replace("&&&VARIABLE&&&", ageVariable);
  return (
    <>
      <b>
        {questionNumber}. {labelWithAgeVariable}
      </b>
      <GridWithTotals gridData={rows} />
    </>
  );
};

export default QuestionComponent;

// the question component just needs to repeat all of the
// questions present in currentForm.questions
// questioncomponent does not care about age range

// grid with totals is looking for question.rows, the array of ROWS
// so gridwittotals will need just a SINGLE question

// ADD ternary to question, send to grid with totals IF type is "datagridwithtotals"

// NOTE: If the range_ids change, they will need to change here as well
// APPARENTLY question number is meant to be derived from the last 2 digits of form_answers.question
// this will have to be done after question & answer have been combined in redux

const questionVariables = {
  "0000": "Under Age 0",
  "0001": "between the ages of 0 and 1",
  "0105": "between the ages of 1 and 5",
  "0612": "between the ages of 6 and 12",
  1318: "Between the ages of 13 and 18"
};
