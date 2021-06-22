import { Link } from "react-router-dom";
import React from "react";
import moment from "moment-timezone";

const sortQuestionColumns = columnArray => {
  let sortedColumns = columnArray.map(singleRow =>
    Object.entries(singleRow)
      .sort((a, b) => a[0].slice(-1) - b[0].slice(-1))
      .reduce((accumulator, [k, v]) => ({ ...accumulator, [k]: v }), {})
  );
  return sortedColumns;
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

const gatherByAgeRange = answersArray => {
  // call back for a reduce method
  let accumulator = {};

  answersArray.forEach(answer => {
    let ageRange = answer.rangeId;
    let questionNumber = answer.question.slice(-2);

    if (accumulator[ageRange]) {
      accumulator[ageRange][questionNumber] = answer;
    } else {
      accumulator[ageRange] = { [questionNumber]: answer };
    }
    return accumulator;
  });

  return accumulator;
};
// const gatherByAgeRange = answersArray => {
//   // call back for a reduce method
//   const assembleByAge = (accumulator, answer) => {
//     let ageRange = answer.rangeId;

//     if (accumulator[ageRange]) {
//       accumulator.push(answer)
//     } else {
//       accumulator[ageRange] = [...answer]
//     }
//     return accumulator;
//   };

//   return answersArray.reduce(assembleByAge, {})

// };

export {
  sortQuestionColumns,
  dateFormatter,
  compileStatesForDropdown,
  compileSimpleArrayStates,
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter,
  gatherByAgeRange
};
