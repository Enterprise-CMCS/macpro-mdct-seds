import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import jsonpath from "jsonpath";
import "./SynthesizedGrid.scss";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";
import { gatherByAgeRange } from "../../utility-functions/sortingFunctions";

const SynthesizedGridSummary = ({
  allAnswers, // now answers, used to be all of current form
  questionID, // same
  gridData, // same
  questionNumber,
  label
}) => {
  const [sortedRows, setSortedRows] = useState([]);

  useEffect(() => {
    updateSynthesizedGrid();
  }, [gridData, allAnswers]); // eslint-disable-line react-hooks/exhaustive-deps

  // Grab all questions 1 and 4
  // map through each, building an object with question id, tab & rows
  // split/find them by age range, calculte
  // add to an accumulator

  // This function updates the grid based on the answers present in redux
  // Its triggered in this component's useEffect and passed to <GridWithTotals/> as a callback as well
  const updateSynthesizedGrid = () => {
    // Retrieve the answers specific to the current tab
    //   const tabAnswers = allAnswers.filter(element => element.rangeId === range);

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

    let x;
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

    let a;
    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    setSortedRows(sortQuestionColumns(calculatedRows));
  };

  // incoming formula
  //   {
  //     targets: [
  //       "$..[?(@.question=='2021-64.21E-04')].rows[1].col6",
  //       "$..[?(@.question=='2021-64.21E-01')].rows[1].col6"
  //     ],
  //     actions: ["formula"],
  //     formula: "<0> / <1>"
  //   }

  // ALL WORK IN THIS METHOD WILL BE REPEATED FOR EACH TAB.
  // LIMIT ITERATIONS AT THE COST OF SPACE
  const calculateValue = (incomingFormula, sortedAnswers) => {
    let returnValue = null;

    // FIND Q4(T1) / Q1(T1)
    // FIND Q4(T2) / Q1(T2)
    // FIND Q4(T3) / Q1(T3)

    // GO TAB BY TAB

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
    let x;
    return returnValue;
  };

  const labelWithAgeVariable = label.replace("&&&VARIABLE&&&", "of all ages");
  const formattedQuestionNumber = parseInt(questionNumber.split("-").slice(-1));

  return (
    <>
      <div className="question-component padding-top-5 border-top-1px">
        <b>
          {formattedQuestionNumber}. {labelWithAgeVariable}
        </b>
        <GridWithTotals
          questionID={`summary-synthesized-${questionID}`}
          gridData={sortedRows}
          disabled={true}
          synthesized={true}
          precision={1}
        />
        <div className="disclaimer">
          {" "}
          Values will not appear until source data is provided
        </div>
      </div>
    </>
  );
};

SynthesizedGridSummary.propTypes = {
  allAnswers: PropTypes.object.isRequired,
  questionID: PropTypes.string.isRequired,
  gridData: PropTypes.array.isRequired
  //   range: PropTypes.string.isRequired
};

export default SynthesizedGridSummary;

// GRID DATA
// [
//   {
//     col1: "",
//     col2: "% of FPL 0-133",
//     col3: "% of FPL 134-200",
//     col4: "% of FPL 201-250",
//     col5: "% of FPL 251-300",
//     col6: "% of FPL 301-317"
//   },
//   {
//     col1: "A. Fee-for-Service",
//     col2: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[1].col2",
//           "$..[?(@.question=='2021-64.21E-01')].rows[1].col2"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col3: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[1].col3",
//           "$..[?(@.question=='2021-64.21E-01')].rows[1].col3"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col4: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[1].col4",
//           "$..[?(@.question=='2021-64.21E-01')].rows[1].col4"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col5: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[1].col5",
//           "$..[?(@.question=='2021-64.21E-01')].rows[1].col5"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col6: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[1].col6",
//           "$..[?(@.question=='2021-64.21E-01')].rows[1].col6"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ]
//   },
//   {
//     col1: "B. Managed Care Arrangements",
//     col2: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[2].col2",
//           "$..[?(@.question=='2021-64.21E-01')].rows[2].col2"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col3: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[2].col3",
//           "$..[?(@.question=='2021-64.21E-01')].rows[2].col3"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col4: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[2].col4",
//           "$..[?(@.question=='2021-64.21E-01')].rows[2].col4"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col5: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[2].col5",
//           "$..[?(@.question=='2021-64.21E-01')].rows[2].col5"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col6: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[2].col6",
//           "$..[?(@.question=='2021-64.21E-01')].rows[2].col6"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ]
//   },
//   {
//     col1: "C. Primary Care Case Management",
//     col2: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[3].col2",
//           "$..[?(@.question=='2021-64.21E-01')].rows[3].col2"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col3: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[3].col3",
//           "$..[?(@.question=='2021-64.21E-01')].rows[3].col3"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col4: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[3].col4",
//           "$..[?(@.question=='2021-64.21E-01')].rows[3].col4"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col5: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[3].col5",
//           "$..[?(@.question=='2021-64.21E-01')].rows[3].col5"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ],
//     col6: [
//       {
//         targets: [
//           "$..[?(@.question=='2021-64.21E-04')].rows[3].col6",
//           "$..[?(@.question=='2021-64.21E-01')].rows[3].col6"
//         ],
//         actions: ["formula"],
//         formula: "<0> / <1>"
//       }
//     ]
//   }
// ];
