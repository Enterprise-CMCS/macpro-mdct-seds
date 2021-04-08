// ACTION TYPES
export const SUMMARY_NOTES_SUCCESS = "SUMMARY_NOTES_SUCCESS";
export const SUMMARY_NOTES_FAILURE = "SUMMARY_NOTES_FAILURE";

// ACTION CREATORS
export const setSummaryNotes = summaryNotes => {
  const tempSummaryNotes = [
    {
      type: "text_multiline",
      entry: summaryNotes
    }
  ];
  return {
    type: SUMMARY_NOTES_SUCCESS,
    tempSummaryNotes
  };
};

// THUNK FUNCTIONS
export const saveSummaryNotes = summaryNotes => async dispatch => {
  try {
    dispatch(setSummaryNotes(summaryNotes));
  } catch (error) {
    dispatch({ type: SUMMARY_NOTES_FAILURE });
  }
};
