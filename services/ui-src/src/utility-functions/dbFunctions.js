import { listFormsForQuarter } from "../libs/api";

// Recursively call getStateForms until all values are returned
export const recursiveGetStateForms = async (data, currentData) => {
  // Get array data from previous iteration or set to empty array
  let returnItems = currentData ?? [];

  let formData = {
    state: data.state,
    year: data.year,
    quarter: data.quarter,
    startKey: data.startKey ?? false,
  };

  let response = await listFormsForQuarter(formData);

  returnItems = returnItems.concat(response.Items);

  if (response.LastEvaluatedKey) {
    data.startKey = response.LastEvaluatedKey;
    return await recursiveGetStateForms(data, returnItems);
  }
  return returnItems;
};
