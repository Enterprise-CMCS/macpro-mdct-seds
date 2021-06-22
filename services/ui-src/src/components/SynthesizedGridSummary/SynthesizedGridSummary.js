import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import jsonpath from "jsonpath";
import "./SynthesizedGridSummary.scss";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";
import { gatherByAgeRange } from "../../utility-functions/sortingFunctions";

const SynthesizedGridSummary = ({
  allAnswers,
  questionID,
  gridData,
  label
}) => {
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    updateSynthesizedGrid();
  }, [gridData, allAnswers]); // eslint-disable-line react-hooks/exhaustive-deps

  // This function updates the grid based on the answers present in redux

  const updateSynthesizedGrid = () => {
    // Make a deep copy of this single questions rows and confirm that they're sorted
    const sortedGridData = sortQuestionColumns(
      JSON.parse(JSON.stringify(gridData))
    );

    // All cells share the same target questions, find the target questions
    const answersToFind = sortedGridData[1]["col2"][0]["targets"]
      ? sortedGridData[1]["col2"][0]["targets"]
      : sortedGridData[2]["col2"][0]["targets"];

    const stripedIDs = answersToFind.map(
      targetString => targetString.split("'")[1]
    );

    // Find all questions that match questionID and add them to one array
    let matchingQuestions = [];

    stripedIDs.forEach(searchID => {
      const jpexpr = `$..[?(@.question==='${searchID}')]`;
      matchingQuestions = [
        ...matchingQuestions,
        ...jsonpath.query(allAnswers, jpexpr)
      ];
    });

    // Organize the asnwer objects into a nested object for easier access and fewer iterations in the future
    const sortedAnswers = gatherByAgeRange(matchingQuestions);

    //  Map through the sorted rows(obj) for this specific question
    // For each row, build a new row object
    let calculatedRows = sortedGridData.map(singleRow => {
      // build a new object for each row
      const accumulator = {};

      // The first row remains the same
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
        // Map through each row object, copying keys and calculating values (ie: col1, col2)
        Object.keys(singleRow).forEach(element => {
          if (element === "col1") {
            accumulator[element] = singleRow[element];
          } else {
            accumulator[element] = calculateValue(
              singleRow[element][0],
              sortedAnswers
            );
          }
        });
        return accumulator;
      }
    });

    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    setSortedRows(sortQuestionColumns(calculatedRows));
  };

  const calculateValue = (incomingFormula, sortedAnswers) => {
    let returnValue = null;
    let accumulator = 0;

    // Map through each row object, copying keys and calculating values
    Object.keys(sortedAnswers).forEach(range => {
      const operands = incomingFormula.targets.map(target =>
        selectRowColumnValueFromArray(sortedAnswers[range], target)
      );
      // calculates the value based off of the formula <0> / <1>,
      let quotient = operands[0] / operands[1];
      if (quotient && quotient !== Infinity) {
        accumulator += quotient;
      }
    });

    // If the quotient is not a falsy value return it. Otherwise, return null
    if (accumulator) {
      returnValue = accumulator;
    }

    return returnValue;
  };

  const labelWithAgeVariable = label.replace("&&&VARIABLE&&&", "of all ages");
  const formattedQuestionNumber = parseInt(
    questionID.slice(-2).split("-").slice(-1)
  );

  return (
    <>
      <div className="question-component padding-top-5 border-top-1px">
        <b
          className="synthesized-summary-label"
          data-testid="synthesized-summary-label"
        >
          {formattedQuestionNumber}. {labelWithAgeVariable}
        </b>
        <GridWithTotals
          questionID={`summary-synthesized-${questionID}`}
          gridData={sortedRows}
          disabled={true}
          synthesized={true}
          precision={1}
        />
        <div className="disclaimer" data-testid="synthesized-disclaimer">
          {" "}
          Values will not appear until source data is provided
        </div>
      </div>
    </>
  );
};

SynthesizedGridSummary.propTypes = {
  allAnswers: PropTypes.array.isRequired,
  questionID: PropTypes.string.isRequired,
  gridData: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired
};

export default SynthesizedGridSummary;
