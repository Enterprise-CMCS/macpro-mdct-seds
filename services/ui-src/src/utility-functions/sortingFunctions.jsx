import React from "react";
import { Link } from "react-router-dom";
import { selectRowColumnValueFromArray } from "./jsonPath";

const sortQuestionColumns = (columnArray) => {
  let sortedColumns = columnArray.map((singleRow) =>
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
const sortRowArray = (arrayOfRows) => {
  let deepCopy = JSON.parse(JSON.stringify(arrayOfRows));
  const headerIdx = deepCopy.findIndex((element) => element["col1"] === "");
  let header = deepCopy.splice(headerIdx, 1)[0];
  let sortedRows = deepCopy.sort((a, b) =>
    a["col1"][0] > b["col1"][0] ? 1 : b["col1"][0] > a["col1"][0] ? -1 : 0
  );

  sortedRows.unshift(header);
  return sortedRows;
};

/**
 * @param {string} dateString An ISO-formatted date,
 *  like `"2021-10-05T14:48:00.000Z"`
 * @returns {string} The given date, converted to U.S. Eastern time,
 *  and formatted like `"10/5/2021 at 10:48:00 AM EDT"`
 */
const dateFormatter = (dateString) => {
  if (!dateString) {
    return "Date not supplied";
  }

  try {
    const date = new Date(dateString);
    const dateParts = formattedPartsET(date, {
      // Note: I wish I could use dateStyle here, but none of the presets work.
      // I want a 4-digit year and a numeric month; the `full`, `long`, and
      // `medium` dateStyles spell out the month; `short` has a 2-digit year.
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const timeParts = formattedPartsET(date, { timeStyle: "long" });
    const yyyy = dateParts("year");
    const M = dateParts("month");
    const d = dateParts("day");
    const h = timeParts("hour");
    const mm = timeParts("minute");
    const ss = timeParts("second");
    const amOrPm = timeParts("dayPeriod");
    const zzz = timeParts("timeZoneName");
    return `${M}/${d}/${yyyy} at ${h}:${mm}:${ss} ${amOrPm} ${zzz}`;
  } catch (err) {
    console.error(err);
    return `${dateString} GMT`;
  }
};

const formattedPartsET = (date, options) => {
  const zone = { timeZone: "America/New_York" };
  const formatter = new Intl.DateTimeFormat("en-US", { ...options, ...zone });
  const parts = formatter.formatToParts(date);
  return (type) => parts.find((part) => part.type === type).value;
};

/**
 * Sorts array by year and quarter descending
 * @param formsArray - multidimensional array of forms
 * @returns {*}
 */
const sortFormsByYearAndQuarter = (formsArray) => {
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
    uniqueYears = Array.from(new Set(formsArray.map((a) => a.year))).map(
      (year) => {
        return formsArray.find((a) => a.year === year);
      }
    );
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
      uniqueQuarters = Array.from(new Set(quarters.map((a) => a.quarter))).map(
        (quarter) => {
          return quarters.find((a) => a.quarter === quarter);
        }
      );
    }

    // Sort by quarters
    uniqueQuarters.sort((a, b) => (a.quarter > b.quarter ? 1 : -1));

    // Build output for each accordion item
    let quartersOutput = (
      <ul>
        {uniqueQuarters.map((element) => {
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
      headingLevel: "h1", // unsure
      expanded: expanded,
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

const gatherByQuestion = (answersArray) => {
  let accumulator = {};

  // call back for a reduce method
  answersArray.forEach((answer) => {
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
  /* eslint-disable no-param-reassign */

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
  /* eslint-disable no-param-reassign */
};

/**
 * To be used in sort() to sort by col1 (the question row label)
 * @param a
 * @param b
 * @returns {number|number}
 */
const sortByCol1 = (a, b) => {
  const first = a.col1 !== "" ? parseInt(a.col1.split(".")[0]) : null;
  const second = b.col1 !== "" ? parseInt(b.col1.split(".")[0]) : null;

  if (first === second) {
    return 0;
  }
  // nulls sort after anything else
  /* eslint-disable valid-typeof */
  else if (typeof first == null) {
    return 1;
    /* eslint-disable valid-typeof */
  } else if (typeof second == null) {
    return -1;
  }

  return first < second ? -1 : 1;
};

export {
  sortQuestionColumns,
  dateFormatter,
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter,
  gatherByQuestion,
  reduceEntries,
  sortRowArray,
  sortByCol1,
};
