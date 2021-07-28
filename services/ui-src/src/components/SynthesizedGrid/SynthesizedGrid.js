import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./SynthesizedGrid.scss";
import {
  selectRowColumnValueFromArray,
  selectColumnValuesFromArray,
  selectRowValuesFromArray
} from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGrid = ({ entireForm, questionID, gridData, range }) => {
  const [sortedRows, setSortedRows] = useState([]);
  const [sortedTotals, setSortedTotals] = useState([]);
  const [sortedRowsTotals, setSortedRowsTotals] = useState([]);

  useEffect(() => {
    updateSynthesizedGrid();
  }, [gridData, entireForm]); // eslint-disable-line react-hooks/exhaustive-deps

  // This function updates the grid based on the answers present in redux
  // Its triggered in this component's useEffect and passed to <GridWithTotals/> as a callback as well
  const updateSynthesizedGrid = () => {
    // Retrieve the answers specific to the current tab
    const tabAnswers = entireForm.answers.filter(
      element => element.rangeId === range
    );
    let payload = [];

    //  Map through the sorted rows for this specific question
    let calculatedRows = gridData.map(singleRow => {
      // build a new object for each row
      const accumulator = {};

      // The first row remains the same
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
        // Map through each row object, copying keys and calculating values
        Object.keys(singleRow).forEach(element => {
          if (element === "col1") {
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

    //  Map through the sorted rows for this specific question
    let calculatedColunmTotals = gridData.map(singleRow => {
      // build a new object for each row
      const accumulator = {};

      // The first row remains the same
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
        // Map through each row object, copying keys and calculating values
        Object.keys(singleRow).forEach(element => {
          if (element === "col1") {
            accumulator[element] = "";
          } else {
            accumulator[element] = calculateColumnTotalValue(
              singleRow[element][0],
              tabAnswers,
              element
            );
          }
        });
        return accumulator;
      }
    });

    gridData.map(singleRow => {
      // build a new object for each row
      const accumulator = {};

      // The first row remains the same
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
        // Map through each row object, copying keys and calculating values
        Object.keys(singleRow).forEach(element => {
          if (element === "col1") {
            accumulator[element] = "";
          } else {
            accumulator[element] = calculateRowTotalValue(
              singleRow[element][0],
              tabAnswers,
              element
            );
          }
        });
      }
      payload.push(accumulator.col2)
      return accumulator;
    });

    // Convert to simple array
    const totalsArray = Object.values(calculatedColunmTotals[2]);
    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    setSortedRows(sortQuestionColumns(calculatedRows));
    setSortedTotals(totalsArray);
    setSortedRowsTotals(payload)
  };

  const calculateValue = (incomingFormula, tabAnswers) => {
    let returnValue = null;
    // Incoming Formula is the object that includes a 'target', 'actions' and 'formula'
    const operands = incomingFormula.targets.map(target => {
      return selectRowColumnValueFromArray(tabAnswers, target);
    });
    // calculates the value based off of the formula <0> / <1>,
    // This formula is currently hard coded
    let quotient = operands[0] / operands[1];

    // If the quotient is not a falsy value or infinity, return it. Otherwise, return null
    if (quotient && quotient !== Infinity) {
      returnValue = quotient ? quotient : 0;
    }

    return returnValue;
  };

  // Add values together, then divide
  const calculateColumnTotalValue = (incomingFormula, tabAnswers, col) => {
    let returnValue = null;

    // Use formula to loop through all matching columns in question and accumulate
    const questionTotal = incomingFormula.targets.map(target => {
      return selectColumnValuesFromArray(tabAnswers, target);
    });

    // Use hard coded formula
    let quotient = questionTotal[0] / questionTotal[1];

    // If the quotient is not a falsy value or infinity, return it. Otherwise, return zero
    if (quotient && quotient !== Infinity) {
      returnValue = quotient ? quotient : 0;
    }

    return returnValue;
  };

  // Add values together, then divide
  const calculateRowTotalValue = (incomingFormula, tabAnswers, col) => {
    let returnValue = null;
    // Use formula to loop through all matching columns in question and accumulate
    const questionTotal = incomingFormula.targets.map(target => {
      return selectRowValuesFromArray(tabAnswers, target);
    });

    // Use hard coded formula
    let quotient = questionTotal[0] / questionTotal[1];

    // If the quotient is not a falsy value or infinity, return it. Otherwise, return zero
    if (quotient && quotient !== Infinity) {
      returnValue = quotient ? quotient : 0;
    }    
    return returnValue;
  };

  return (
    <>
      <GridWithTotals
        questionID={questionID}
        gridData={sortedRows}
        disabled={true}
        synthesized={true}
        precision={1}
        updateSynthesizedValues={updateSynthesizedGrid}
        totals={sortedTotals}
        rowTotals = {sortedRowsTotals}
      />
      <div className="disclaimer">
        {" "}
        Values will not appear until source data is provided
      </div>
    </>
  );
};

SynthesizedGrid.propTypes = {
  entireForm: PropTypes.object.isRequired,
  questionID: PropTypes.string.isRequired,
  gridData: PropTypes.array.isRequired,
  range: PropTypes.string.isRequired
};

const mapState = state => ({
  entireForm: state.currentForm
});

export default connect(mapState)(SynthesizedGrid);
