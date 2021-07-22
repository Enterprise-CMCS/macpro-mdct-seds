import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./SynthesizedGrid.scss";
import jsonpath, {
  selectRowColumnValueFromArray,
  selectColumnValuesFromArray
} from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGrid = ({ enitreForm, questionID, gridData, range }) => {
  const [sortedRows, setSortedRows] = useState([]);
  const [sortedTotals, setSortedTotals] = useState([]);

  // console.log("zzzGridData", gridData);
  useEffect(() => {
    updateSynthesizedGrid();
  }, [gridData, enitreForm]); // eslint-disable-line react-hooks/exhaustive-deps

  // This function updates the grid based on the answers present in redux
  // Its triggered in this component's useEffect and passed to <GridWithTotals/> as a callback as well
  const updateSynthesizedGrid = () => {
    // Retrieve the answers specific to the current tab
    const tabAnswers = enitreForm.answers.filter(
      element => element.rangeId === range
    );

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
    let calculatedTotals = gridData.map(singleRow => {
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
            accumulator[element] = calculateTotalValue(
              singleRow[element][0],
              tabAnswers,
              element
            );
          }
        });
        return accumulator;
      }
    });

    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    console.log("zzzCalculatedRows", calculatedRows);
    console.log("zzzCalculatedTotals", calculatedTotals[1]);
    setSortedRows(sortQuestionColumns(calculatedRows));
    setSortedTotals(calculatedTotals);
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

  const calculateTotalValue = (incomingFormula, tabAnswers, col) => {
    let returnValue = null;

    // Use formula to loop through all matching columns in question and accumulate
    const questionTotal = incomingFormula.targets.map(target => {
      return selectColumnValuesFromArray(tabAnswers, target);
    });

    console.log("zzzQuestionTotal", questionTotal);

    const selectRowColumnValueFromArray = (array, id) => {
      const foundValue = jsonpath.query(array, id)[0];
      const returnValue = foundValue !== null ? foundValue : 0;
      return returnValue;
    };

    // Incoming Formula is the object that includes a 'target', 'actions' and 'formula'
    const operands = incomingFormula.targets.map(target => {
      return selectRowColumnValueFromArray(tabAnswers, target);
    });
    console.log("zzzOperands", operands);

    // calculates the value based off of the formula <0> / <1>,
    // This formula is currently hard coded
    let quotient = operands[0] / operands[1];

    // If the quotient is not a falsy value or infinity, return it. Otherwise, return zero
    if (quotient && quotient !== Infinity) {
      returnValue = quotient ? quotient : 0;
    }

    console.log("zzzReturnValue", returnValue);
    return returnValue;
  };

  return (
    <>
      ${console.log("zzzSortedRows", sortedRows)}$
      {console.log("zzzSortedTotals", sortedTotals)}
      <GridWithTotals
        questionID={questionID}
        gridData={sortedRows}
        disabled={true}
        synthesized={true}
        precision={1}
        updateSynthesizedValues={updateSynthesizedGrid}
        totals={sortedTotals}
      />
      <div className="disclaimer">
        {" "}
        Values will not appear until source data is provided
      </div>
    </>
  );
};

SynthesizedGrid.propTypes = {
  enitreForm: PropTypes.object.isRequired,
  questionID: PropTypes.string.isRequired,
  gridData: PropTypes.array.isRequired,
  range: PropTypes.string.isRequired
};

const mapState = state => ({
  enitreForm: state.currentForm
});

export default connect(mapState)(SynthesizedGrid);
