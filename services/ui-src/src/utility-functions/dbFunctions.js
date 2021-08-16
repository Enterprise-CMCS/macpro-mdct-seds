import { getStateForms } from "../libs/api";

// Recursively call getStateForms until all values are returned
// Required data: state, year, quarter, startKey(optional)
export const recursiveGetStateForms = async data => {
  // Init response array
  const returnItems = [];

  // Set up initial retrieval (no start key)
  let response = await getStateForms({
    state: data.state,
    year: data.year,
    quarter: data.quarter
  });

  // Add just the Items to the response array
  returnItems.push(...response.Items);

  // If LastEvaluatedKey is NOT undefined, there are more records to retrieve. So call the function again.
  if (response.LastEvaluatedKey !== undefined) {
    return await recursiveGetStateForms({
      state: data.state,
      year: data.year,
      quarter: data.quarter,
      startKey: response.LastEvaluatedKey
    });
  }
  return returnItems;
};
