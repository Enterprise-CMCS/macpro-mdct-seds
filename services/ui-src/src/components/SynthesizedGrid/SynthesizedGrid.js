import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGrid = ({ gridData, allAnswers, range, questionID }) => {
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    const tabAnswers = allAnswers.filter(element => element.rangeId === range);
    // Answer data === single question 5
    // answerData.rows (see annex)

    let calculatedRows = gridData.map(singleRow => {
      const accumulator = {};
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
        console.log("SINGLE ROW ?????????????", singleRow);
        Object.keys(singleRow).forEach(element => {
          if (element == "col1") {
            accumulator[element] = singleRow[element];
          } else {
            accumulator[element] = calculateValue(
              singleRow[element][0],
              tabAnswers
            );
          }
        });
        let x = 0;
        console.log("NEW OBJECT????", accumulator);
        return accumulator;
      }
    });
    console.log("SYNTHESIZED GRID UPDATED!!!!!", questionID);
    setSortedRows(sortQuestionColumns(calculatedRows));
  }, [gridData, allAnswers]);

  const calculateValue = (incomingFormula, tabAnswers) => {
    let returnValue = 0;
    // Incoming Formula is the object that includes a 'target', 'actions' and 'formula'
    if (incomingFormula.actions && incomingFormula.actions[0] === "formula") {
      const operands = incomingFormula.targets.map(target =>
        selectRowColumnValueFromArray(tabAnswers, target)
      );

      // calculates the value based off of the formula <0> / <1>,
      // This formular is currently hard coded but should be made dynamic in case the formula is subject to change
      let quotient = operands[0] / operands[1];
      returnValue = quotient ? quotient : 0;
      let a = 0;
    }
    return returnValue;
  };

  return (
    <GridWithTotals
      questionID={questionID}
      gridData={sortedRows}
      precision={1}
      disabled={true}
      synthesized={true}
    />
  );
};

SynthesizedGrid.propTypes = {
  answerData: PropTypes.object.isRequired,
  allAnswers: PropTypes.array.isRequired
};

const mapState = state => ({
  allAnswers: state.currentForm.answers
});

export default connect(mapState)(SynthesizedGrid);
