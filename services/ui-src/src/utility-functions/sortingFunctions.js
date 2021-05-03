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

  if (dateString !== "" && dateString !== null && dateString !== undefined) {
    // datestring will be saved as ISO string, ie: 2011-10-05T14:48:00.000Z
    const splitDate = dateString.split("T");
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

    returnString = `${date[1]}-${date[2]}-${date[0]} at ${hour}:${minutes}:${seconds} ${amOrPm}`;
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
  const selectedStates = [];

  // Create single array of objects with label and value of userStates
  // This is the format for dropdowns in this project
  if (userStates.length > 0) {
    for (const singleState in userStates) {
      for (const state in stateList) {
        if (stateList[state].value === userStates[singleState]) {
          selectedStates.push({
            label: stateList[state].label,
            value: stateList[state].value
          });
        }
      }
    }
  }
  return selectedStates;
};

export {
  sortQuestionColumns,
  dateFormatter,
  compileStatesForDropdown,
  compileSimpleArrayStates
};
