import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGrid = props => {
  const tempQuestionId = props.questionID;
  const [synthGridData, setSynthGridData] = useState([]);
  useEffect(() => {
    const { answerData, gridData, allAnswers } = props;

    let tempGridData = [];
    const tabAnswers = allAnswers.filter(
      element => element.rangeId === answerData.rangeId
    );

    answerData.rows.map((row, rowIndex) => {
      // add header row
      if (rowIndex === 0) {
        tempGridData[rowIndex] = gridData[rowIndex];
      } else {
        let tempRowObject = {};
        Object.entries(row).forEach(key => {
          // get row header
          if (key[0] === "col1") {
            tempRowObject = Object.assign(tempRowObject, { [key[0]]: key[1] });
          }
          //calculate values for each column by row
          else {
            let tempCalculatedValue = calculateValue(key[1][0], tabAnswers);
            tempRowObject = Object.assign(tempRowObject, {
              [key[0]]: tempCalculatedValue
            });
          }
        });
        tempGridData.push(tempRowObject);
      }
      setSynthGridData(tempGridData);
      return true;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateValue = (incomingCalculation, tabAnswers) => {
    if (
      incomingCalculation.actions &&
      incomingCalculation.actions[0] === "formula"
    ) {
      let tempCalculation = [];
      let returnValue = {};
      Object.entries(incomingCalculation.targets).forEach(key => {
        // gets value for each target
        tempCalculation[key[0]] = selectRowColumnValueFromArray(
          tabAnswers,
          key[1]
        );
      });
      // calculates the value based off of the formula <0> / <1>
      returnValue = tempCalculation[0] / tempCalculation[1];
      return returnValue;
    }
  };

  const sortedRows = sortQuestionColumns(synthGridData);
  let returnObject = [];

  if (sortedRows.length > 0) {
    returnObject = (
        <GridWithTotals
          questionID={tempQuestionId}
          gridData={sortedRows}
          precision={1}
          disabled={true}
          synthesized={true}
        />
    );
  }
  return returnObject;
};

SynthesizedGrid.propTypes = {
  answerData: PropTypes.object.isRequired,
  allAnswers: PropTypes.array.isRequired
};

const mapState = state => ({
  allAnswers: state.currentForm.answers
});

export default connect(mapState)(SynthesizedGrid);
