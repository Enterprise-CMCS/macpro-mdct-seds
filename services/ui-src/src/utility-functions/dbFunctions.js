import { getStateForms } from "../libs/api";

// Recursively call getStateForms until all values are returned
// Init response array
const returnItems = [];
export const recursiveGetStateForms = async data => {
  // If startKey has value, use it
  // this is the LastEvaluatedKey from the previous scan
  const startKey = data.startKey ?? false;

  let formData = {
    state: data.state,
    year: data.year,
    quarter: data.quarter,
    startKey: startKey
  };

  // Pull data
  let response = await getStateForms(formData);

  // If already in array, don't add it
  // Check for (db) matching value of current item state_form
  for (let i in response.Items) {
    let hasItem = returnItems.some(
      e => e.state_form === response.Items[i].state_form
    );

    // If not already in array, add it
    if (!hasItem) {
      returnItems.push(response.Items[i]);
    }
  }

  if (response.LastEvaluatedKey !== undefined) {
    const newData = data;
    newData.startKey = response.LastEvaluatedKey;
    return await recursiveGetStateForms(newData);
  }
  return returnItems;
};
