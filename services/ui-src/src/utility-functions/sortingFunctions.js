import { Link } from "react-router-dom";
import React from "react";
import moment from "moment-timezone";
import { selectRowColumnValueFromArray } from "./jsonPath";

const sortQuestionColumns = columnArray => {
  let sortedColumns = columnArray.map(singleRow =>
    Object.entries(singleRow)
      .sort((a, b) => a[0].slice(-1) - b[0].slice(-1))
      .reduce((accumulator, [k, v]) => ({ ...accumulator, [k]: v }), {})
  );
  return sortedColumns;
};

/**
 * This function sorts the rows in the rows array
 * @function sortRowArray
 * @param {array} arrayOfRows - Rows array with column objects
 * @returns {array} - Sorted rows with the header first
 */
const sortRowArray = arrayOfRows => {
  let sortedRows = [];
  arrayOfRows.forEach(singleRow => {
    const columnHeader = singleRow["col1"];
    if (columnHeader === "") {
      sortedRows[0] = singleRow;
    } else if (columnHeader[0] === "A") {
      sortedRows[1] = singleRow;
    } else if (columnHeader[0] === "B") {
      sortedRows[2] = singleRow;
    } else if (columnHeader[0] === "C") {
      sortedRows[3] = singleRow;
    }
  });
  return sortedRows;
};

const dateFormatter = dateString => {
  let returnString = "Date not supplied";

  if (dateString) {
    // datestring will be saved as ISO string, ie: 2021-10-05T14:48:00.000Z
    try {
      let estDate = moment.tz(dateString, "America/New_York").format();

      const splitDate = estDate.split("T");
      const date = splitDate[0].split("-");
      const time = splitDate[1].split(":");
      const minutes = time[1];
      const seconds = time[2].slice(0, 2);

      let amOrPm;
      let parsedHour = parseInt(time[0]);
      let hour;

      if (parsedHour > 12) {
        amOrPm = "pm";
        hour = parsedHour - 12;
      } else {
        amOrPm = "am";
        hour = parsedHour;
      }

      returnString = `${date[1]}-${date[2]}-${date[0]} at ${hour}:${minutes}:${seconds} ${amOrPm} EST`;
    } catch (error) {
      returnString = `${dateString} GMT`;
    }
  }
  return returnString;
};

const compileSimpleArrayStates = complexArray => {
  const simpleArray = [];
  for (const item in complexArray) {
    simpleArray.push(complexArray[item].value);
  }
  return simpleArray;
};

/**
 * This function creates an array of objects suitable for dropdowns.
 *
 * @param stateList - list of all U.S. states (probably from redux)
 * @param userStates - list of states to select from (user states)
 * @returns {*[]} - an array of objects suitable for a dropdown component
 */

const compileStatesForDropdown = (stateList, userStates) => {
  let selectedStates = [];

  // Create single array of objects with label and value of userStates
  // This is the format for dropdowns in this project
  if (userStates.length > 0) {
    selectedStates = stateList.filter(state =>
      userStates.includes(state.value)
    );
  }
  return selectedStates;
};

/**
 * Sorts array by year and quarter descending
 * @param formsArray - multidimensional array of forms
 * @returns {*}
 */
const sortFormsByYearAndQuarter = formsArray => {
  // Sort forms descending by year and then quarter
  formsArray.sort(function (a, b) {
    if (a.year === b.year) {
      return a.quarter - b.quarter;
    } else if (a.year < b.year) {
      return 1;
    } else if (a.year > b.year) {
      return -1;
    }
    return false;
  });
  return formsArray;
};

/**
 *
 * @param formsArray
 * @param state
 * @returns {*[]}
 */
const buildSortedAccordionByYearQuarter = (formsArray, state) => {
  let accordionItems = [];
  let uniqueYears;

  if (formsArray) {
    uniqueYears = Array.from(new Set(formsArray.map(a => a.year))).map(year => {
      return formsArray.find(a => a.year === year);
    });
  }

  // Sort by years descending
  uniqueYears.sort((a, b) => (a.year > b.year ? -1 : 1));

  // Loop through years to build quarters
  for (const year in uniqueYears) {
    let quarters = [];

    // Loop through all formData and get quarters if year matches
    for (const form in formsArray) {
      // If years match, add quarter to array
      if (formsArray[form].year === uniqueYears[year].year) {
        quarters.push(formsArray[form]);
      }
    }

    // Remove duplicate quarters
    let uniqueQuarters;
    if (quarters) {
      uniqueQuarters = Array.from(new Set(quarters.map(a => a.quarter))).map(
        quarter => {
          return quarters.find(a => a.quarter === quarter);
        }
      );
    }

    // Sort by quarters
    uniqueQuarters.sort((a, b) => (a.quarter > b.quarter ? 1 : -1));

    // Build output for each accordion item
    let quartersOutput = (
      <ul className="quarterly-items">
        {uniqueQuarters.map(element => {
          return (
            <li key={`${element.quarter}`}>
              <Link
                to={`/forms/${state}/${uniqueYears[year].year}/${element.quarter}`}
              >
                Quarter {`${element.quarter}`}
              </Link>
            </li>
          );
        })}
      </ul>
    );

    // If current year, set expanded to true
    let expanded = false;
    let currentDate = new Date();
    if (uniqueYears[year].year === currentDate.getFullYear()) {
      expanded = true;
    }

    // Build single item
    let item = {
      id: uniqueYears[year].year,
      description: "Quarters for " + uniqueYears[year].year,
      title: uniqueYears[year].year,
      content: quartersOutput,
      expanded: expanded
    };

    accordionItems.push(item);
  }

  return accordionItems;
};

/**
 * This function sorts the answers for the target questions in SynthesizedGridSummary organized by question number
 * @function gatherByQuestion
 * @param {array} answersArray - An array of all questions needed for SGS
 * @returns {object} - An object with the questions nested by question then age range, see example below
 */

const gatherByQuestion = answersArray => {
  let accumulator = {};

  // call back for a reduce method
  answersArray.forEach(answer => {
    let ageRange = answer.rangeId;
    let questionNumber = answer.question.slice(-2);

    if (accumulator[questionNumber]) {
      accumulator[questionNumber][ageRange] = answer;
    } else {
      accumulator[questionNumber] = { [ageRange]: answer };
    }
  });
  return accumulator;
  // example return:
  // {
  //   04:{
  //       1318: {question},
  //       0001: {question},
  //       0105: {question}
  //   },
  //   01:{
  //       1318: {question},
  //       0001: {question},
  //       0105: {question}
  //   },
  // }
};

/**
 * This function returns all of the entries for a single target ID across all tabs/age ranges
 * @function reduceEntries
 * @param {object} answersByAgeRange - An object with all answers for a given question with the keys being the age range it belongs to
 * @param {string} targetID - the ID of the target question, ie: "$..[?(@.question=='2021-64.21E-01')].rows[1].col2"
 * @returns {number} - dividend or divisor
 */
const reduceEntries = (answersByAgeRange, targetID) => {
  // call back for a reduce method
  const findEntries = (accumulator, singleAgeRange) => {
    // singleAgeRange is one key(age range) ie: "1318"

    // Find the target answer in a specific age range
    const foundEntry = selectRowColumnValueFromArray(
      [answersByAgeRange[singleAgeRange]],
      targetID
    );
    return (accumulator += foundEntry); // add to the accumulator
  };
  return Object.keys(answersByAgeRange).reduce(findEntries, 0); // return the accumulated value
};

export {
  sortQuestionColumns,
  dateFormatter,
  compileStatesForDropdown,
  compileSimpleArrayStates,
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter,
  gatherByQuestion,
  reduceEntries,
  sortRowArray
};
