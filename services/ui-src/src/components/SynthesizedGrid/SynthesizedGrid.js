import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGrid = ({ gridData, allAnswers, range, questionID }) => {
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    updateSynthesizedGrid();
  }, [gridData, allAnswers]);

  const updateSynthesizedGrid = () => {
    const tabAnswers = allAnswers.answers.filter(
      element => element.rangeId === range
    );
    let calculatedRows = gridData.map(singleRow => {
      const accumulator = {};
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
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
        return accumulator;
      }
    });
    console.log("SYNTHESIZED GRID RECALCULATE!!!!!!");
    setSortedRows(sortQuestionColumns(calculatedRows));
  };

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

      if (quotient && quotient !== Infinity) {
        returnValue = quotient ? quotient : 0;
      }
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
      updateSynthesizedValues={updateSynthesizedGrid}
    />
  );
};

SynthesizedGrid.propTypes = {
  allAnswers: PropTypes.array.isRequired
};

const mapState = state => ({
  allAnswers: state.currentForm
});

export default connect(mapState)(SynthesizedGrid);
