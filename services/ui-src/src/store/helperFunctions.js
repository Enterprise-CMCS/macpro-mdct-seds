const sortQuestionsByNumber = (q1, q2) => {
  const q1Number = Number.parseInt(q1.question.split("-").slice(-1));
  const q2Number = Number.parseInt(q2.question.split("-").slice(-1));
  return q1Number > q2Number ? 1 : -1;
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

export { sortQuestionsByNumber, extractAgeRanges };
