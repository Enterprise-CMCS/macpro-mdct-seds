import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import jsonpath from "jsonpath";
import "./SynthesizedGridSummary.scss";
import {
  sortQuestionColumns,
  gatherByQuestion,
  reduceEntries,
  sortRowArray,
} from "../../utility-functions/sortingFunctions";

const SynthesizedGridSummary = ({
  allAnswers,
  questionID,
  gridData,
  label,
  questions,
}) => {
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    updateSynthesizedGrid();
  }, [gridData, allAnswers]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSynthesizedGrid = () => {
    // Make a deep copy of this single question & sort
    let sortedGridData = sortRowArray(
      sortQuestionColumns(JSON.parse(JSON.stringify(gridData)))
    );

    // All cells share the same target questions, find the target question IDs
    const answersToFind = sortedGridData[1]["col2"][0]["targets"]
      ? sortedGridData[1]["col2"][0]["targets"]
      : sortedGridData[2]["col2"][0]["targets"];

    //Get just the IDs without their rows or columns
    const stripedIDs = answersToFind.map(
      (targetString) => targetString.split("'")[1]
    );

    // Find all questions that match the striped questionIDs
    let matchingQuestions = [];
    stripedIDs.forEach((searchID) => {
      const jpexpr = `$..[?(@.question==='${searchID}')]`;
      matchingQuestions = [
        ...matchingQuestions,
        ...jsonpath.query(allAnswers, jpexpr),
      ];
    });

    // Organize matching questions array into nested object for easier access & fewer iterations
    const sortedAnswers = gatherByQuestion(matchingQuestions);

    // Map through the sorted rows and create new rows with calculated values
    let calculatedRows = sortedGridData.map((singleRow) => {
      // A new object for each row
      const accumulator = {};
      // The first row remains the same
      if (singleRow["col1"] === "") {
        return singleRow;
      } else {
        // Build the new rows column by column
        Object.keys(singleRow).forEach((element) => {
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

    // map through the target array
    const divisorAndDividend = incomingFormula.targets.map((target) => {
      const currentQuestion = target.split("'")[1].slice(-2); // question 4 or 1
      const pertinentAnswers = sortedAnswers[currentQuestion]; // all answers to one question sorted by age range

      return reduceEntries(pertinentAnswers, target); // returns an array with two numbers (sums)
    });

    // [sum of all target 1's, sum of all target 2's]
    const [divisor, dividend] = divisorAndDividend;

    // calculates the value based off of the formula <0> / <1>,
    const quotient = divisor / dividend;

    if (quotient && quotient !== Infinity) {
      returnValue = quotient;
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
          questions={questions}
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
  label: PropTypes.string.isRequired,
};

export default SynthesizedGridSummary;
