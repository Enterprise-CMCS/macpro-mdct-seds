import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import "./SynthesizedGrid.scss";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGrid = ({ enitreForm, questionID, gridData, range }) => {
  const [sortedRows, setSortedRows] = useState([]);

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

    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    setSortedRows(sortQuestionColumns(calculatedRows));
  };

  const calculateValue = (incomingFormula, tabAnswers) => {
    let returnValue = null;
    // Incoming Formula is the object that includes a 'target', 'actions' and 'formula'
    const operands = incomingFormula.targets.map(target =>
      selectRowColumnValueFromArray(tabAnswers, target)
    );
    // calculates the value based off of the formula <0> / <1>,
    // This formula is currently hard coded
    let quotient = operands[0] / operands[1];

    // If the quotient is not a falsy value or infinity, return it. Otherwise, return null
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
