import GridWithTotals from "../components/GridWithTotals/GridWithTotals";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

// ONE QUESTION
const QuestionComponent = ({ singleQuestion }) => {
  const { label, rows, context_data, form } = singleQuestion;

  return (
    <>
      <p>QUESTION LABEL: {label}</p>
      <GridWithTotals gridData={rows} />
    </>
  );
};

// const mapState = state => ({
//   questions: state.currentForm.questions
// });

export default QuestionComponent;

// the question component just needs to repeat all of the
// questions present in currentForm.questions
// questioncomponent does not care about age range

// grid with totals is looking for question.rows, the array of ROWS
// so gridwittotals will need just a SINGLE question
