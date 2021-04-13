import jsonpath from "jsonpath";

const sortQuestionsByNumber = (q1, q2) => {
  const q1Number = Number.parseInt(q1.question.split("-").slice(-1));
  const q2Number = Number.parseInt(q2.question.split("-").slice(-1));
  return q1Number > q2Number ? 1 : -1;
};

const formatAnswerData = answerArray => {
  const rowArray = [];

  // The first two values of the state data from GridWithTotals are undefined and always will be
  const rows = answerArray.slice(2);

  // for each row, build an object representing the column data
  rows.forEach(singleRow => {
    let rowObject = {};
    // The first two elements of each array is undefined, remove them
    const filteredRow = singleRow.slice(2);

    // Map through the array of input numbers
    filteredRow.forEach((singleInput, columnIndex) => {
      let input = null;
      if (Number.isNaN(singleInput) === false) {
        input = singleInput;
      }
      rowObject[`col${columnIndex + 2}`] = input;
    });
    rowArray.push(rowObject);
  });
  return rowArray;
};

const insertAnswer = (stateAnswers, dataArray, questionID) => {
  // use jsonpath to find location of answer and query for that single answer object
  const queryString = `$..[?(@.answer_entry == "${questionID}")]`;
  const response = jsonpath.query(stateAnswers, queryString)[0];

  // get just the 'rows' array from the answer object
  const rowsOfAnswers = response.rows;

  // create a new, updated array with the new values (skipping the header row)
  const updated = rowsOfAnswers.map((singleRow, idx) => {
    // if this is the header row, return it unaltered
    if (singleRow["col1"] === "") {
      return singleRow;
    } else {
      const matchingInputRow = dataArray[idx - 1];
      return { ...singleRow, ...matchingInputRow };
    }
  });

  // replace the answer object's rows array with the updated version
  response.rows = updated;

  // find the location of this specific answer object
  const idx = stateAnswers.findIndex(
    answerObject => answerObject.answer_entry === questionID
  );

  // replace the entire answer object
  stateAnswers[idx] = response;

  return stateAnswers;
};

const extractAgeRanges = answersArray => {
  // call back for a reduce method
  const findAges = (accumulator, answer) => {
    let ageRange = answer.rangeId;

    if (accumulator[ageRange]) {
      return accumulator;
    } else {
      accumulator[ageRange] = "";
    }
    return accumulator;
  };

  // sort through the answers and return an object whose keys are the unique age ranges present
  // Extract the keys from that object and sort them
  const foundAges = Object.keys(answersArray.reduce(findAges, {})).sort();
  return foundAges;
};

const dateFormatter = () => {
  const newDate = new Date();

  const backwardsDate = newDate.toLocaleDateString("en-gb").split("/");
  const time = newDate.toTimeString().split(" ")[0];

  return `${backwardsDate[1]}/${backwardsDate[0]}/${backwardsDate[2]} at ${time}`;
};

export {
  sortQuestionsByNumber,
  extractAgeRanges,
  insertAnswer,
  formatAnswerData,
  dateFormatter
};
