import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import jsonpath from "jsonpath";
import "./SynthesizedGridSummary.scss";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import {
  sortQuestionColumns,
  gatherByQuestion,
  reduceEntries
} from "../../utility-functions/sortingFunctions";

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
    const sortedAnswers = gatherByQuestion(matchingQuestions);

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

    let b;
    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    setSortedRows(sortQuestionColumns(calculatedRows));
  };

  // {
  //   targets: [
  //     "$..[?(@.question=='2021-64.21E-04')].rows[1].col2",
  //     "$..[?(@.question=='2021-64.21E-01')].rows[1].col2",
  //   ],
  //   actions: [
  //     "formula",
  //   ],
  //   formula: "<0> / <1>",
  // }

  const calculateValue = (incomingFormula, sortedAnswers) => {
    let returnValue = null;

    let a;
    // map through all question 1s, map through all question 4s

    const divisorAndDividend = incomingFormula.targets.map(target => {
      const currentQuestion = target.split("'")[1].slice(-2); // question 4 or 1
      const pertinentAnswers = sortedAnswers[currentQuestion]; // all of question 1s sorted by age range
      let y;
      let sum = reduceEntries(pertinentAnswers, target);
      // const sum = Object.keys(pertinentAnswers).reduce(function (
      //   accumulator,
      //   singleAgeRange
      // ) {
      //   return (accumulator += selectRowColumnValueFromArray(
      //     pertinentAnswers[singleAgeRange],
      //     target
      //   ));
      // },
      // 0);
      return sum;
    });

    let x;

    const divisor = divisorAndDividend[0];
    const dividend = divisorAndDividend[1];
    // const [divisor, dividend] = divisorAndDividend;

    // calculates the value based off of the formula <0> / <1>,
    const quotient = divisor / dividend;
    if (quotient && quotient !== Infinity) {
      returnValue = quotient;
    }

    // If the quotient is not a falsy value return it. Otherwise, return null
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
