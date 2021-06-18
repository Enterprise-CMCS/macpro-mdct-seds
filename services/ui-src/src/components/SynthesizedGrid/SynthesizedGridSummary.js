import React, { useEffect, useState } from "react";
import GridWithTotals from "../GridWithTotals/GridWithTotals";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import jsonpath from "jsonpath";
import "./SynthesizedGrid.scss";
import { selectRowColumnValueFromArray } from "../../utility-functions/jsonPath";
import { sortQuestionColumns } from "../../utility-functions/sortingFunctions";

const SynthesizedGridSummary = ({
  allAnswers, // now answers, used to be all of current form
  questionID, // same
  gridData // same
  //   range
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
    let a;
    stripedIDs.forEach(searchID => {
      const jpexpr = `$..[?(@.question==='${searchID}')]`;

      matchingQuestions = [
        ...matchingQuestions,
        ...jsonpath.query(allAnswers, jpexpr)
      ];
    });

    let b;
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
              matchingQuestions
            );
          }
        });
        return accumulator;
      }
    });

    // Set the calculated grid data to local state to be passed down as a prop to <GridWithTotals/>
    setSortedRows(sortQuestionColumns(calculatedRows));
  };

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
  const calculateValue = (incomingFormula, matchingQuestions) => {
    let returnValue = null;

    // TO PICK UP ON MONDAY, ITERATING THROUGH EACH ID IN THE TARGETS,
    // FIND Q4(TA) / Q1(TA)
    // FIND Q4(TB) / Q1(TB)
    // FIND Q4(TC) / Q1(TC)

    // GO TAB BY TAB

    // worth it to match the tabs together in an object????? YES. cuts down on iteration for EACH CELL
    // GRAB AR 13-18 Q4 THEN GRAB AR 13-18 Q1

    const operands = incomingFormula.targets.forEach(target => {
      let value = selectRowColumnValueFromArray(matchingQuestions, target);
    });

    // Incoming Formula is the object that includes a 'target', 'actions' and 'formula'
    // const operands = incomingFormula.targets.map(target =>
    //   selectRowColumnValueFromArray(matchingQuestions, target)
    // );
    // // calculates the value based off of the formula <0> / <1>,
    // // This formula is currently hard coded
    // let quotient = operands[0] / operands[1];

    // // If the quotient is not a falsy value or infinity, return it. Otherwise, return null
    // if (quotient && quotient !== Infinity) {
    //   returnValue = quotient ? quotient : 0;
    // }
    return null;
    // return returnValue;
  };

  return (
    <>
      <GridWithTotals
        questionID={questionID}
        gridData={sortedRows} // THE ROW TO UPDATE
        disabled={true}
        synthesized={true}
        precision={1}
        updateSynthesizedValues={updateSynthesizedGrid}
      />
      <div className="disclaimer"> WHAT A COOL PLACEHOLDER</div>
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
