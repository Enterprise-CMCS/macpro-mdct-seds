import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Textarea } from "@trussworks/react-uswds";
import { saveSummaryNotes } from "../../store/actions/statusData";

const SummaryNotes = ({ statusData, saveSummaryNotes }) => {
  const [summaryNotes, setSummaryNotes] = useState([]);
  let currentSummaryNotes;

  // Summary tab will load before statusData is populated and this prevents an error
  if (statusData.state_comments !== undefined) {
    currentSummaryNotes = statusData.state_comments[0].entry;
  }

  // Set the initial state of the summary notes
  useEffect(() => {
    setSummaryNotes(currentSummaryNotes);
  }, [currentSummaryNotes]);

  // Update summary notes object locally and in redux
  const updateTempSummaryNotes = e => {
    setSummaryNotes(e.target.value);
  };

  return (
    <>
      <label htmlFor="summaryNotesInput">
        Add any notes here to accompany the form submission
      </label>
      <Textarea
        id="summaryNotesInput"
        name="summaryNotesInput"
        value={summaryNotes}
        type="text"
        onChange={e => updateTempSummaryNotes(e)}
        onBlur={e => saveSummaryNotes(e.target.value)}
        disabled={false}
        className=" margin-left-3 width-widescreen"
      />
    </>
  );
};

SummaryNotes.propTypes = {
  statusData: PropTypes.object.isRequired
};

const mapState = state => ({
  statusData: state.currentForm.statusData
});
const mapDispatch = dispatch => {
  return {
    saveSummaryNotes: summaryNotes => {
      dispatch(saveSummaryNotes(summaryNotes));
    }
  };
};

export default connect(mapState, mapDispatch)(SummaryNotes);
