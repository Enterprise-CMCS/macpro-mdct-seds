import jsonpath from "jsonpath";

export const selectRowColumnValueFromArray = (array, id) => {
  const foundValue = jsonpath.query(array, id)[0];
  const returnValue = foundValue !== null ? foundValue : 0;
  return returnValue;
};
