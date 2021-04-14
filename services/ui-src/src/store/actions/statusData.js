// ACTION TYPES
export const SUMMARY_NOTES_SUCCESS = "SUMMARY_NOTES_SUCCESS";

// ACTION CREATORS
export const saveSummaryNotes = summaryNotes => {
  const tempStateComments = [
    {
      type: "text_multiline",
      entry: summaryNotes
    }
  ];
  return {
    type: SUMMARY_NOTES_SUCCESS,
    tempStateComments: tempStateComments
  };
};
