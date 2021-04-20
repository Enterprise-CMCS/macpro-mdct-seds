const sortQuestionColumns = columnArray => {
  let sortedColumns = columnArray.map(singleRow =>
    Object.entries(singleRow)
      .sort((a, b) => a[0].slice(-1) - b[0].slice(-1))
      .reduce((accumulator, [k, v]) => ({ ...accumulator, [k]: v }), {})
  );
  return sortedColumns;
};

const dateFormatter = dateString => {
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

  return `${date[1]}-${date[2]}-${date[0]} at ${hour}:${minutes}:${seconds} ${amOrPm}`;
};

export { sortQuestionColumns, dateFormatter };
