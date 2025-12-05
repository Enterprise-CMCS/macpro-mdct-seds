import React, { useEffect, useState } from "react";
import { Textarea } from "@trussworks/react-uswds";
import { isFinalCertified } from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

const SummaryNotes = () => {
  const userRole = useStore(state => state.user.role);
  const statusData = useStore(state => state.statusData);
  const saveSummaryNotes = useStore(state => state.updateSummaryNotes);
  const [summaryNotes, setSummaryNotes] = useState([]);
  const disabledNotes = userRole !== "state" || isFinalCertified(statusData);

  // Summary tab will load before statusData is populated and this prevents an error
  let currentSummaryNotes;
  if (statusData.state_comments !== undefined) {
    currentSummaryNotes = statusData.state_comments[0].entry;
  }

  // Set the initial state of the summary notes
  useEffect(() => {
    setSummaryNotes(currentSummaryNotes);
  }, [currentSummaryNotes, statusData]);

  // Update summary notes object locally and in the store
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
        value={summaryNotes ?? ""}
        type="text"
        onChange={e => updateTempSummaryNotes(e)}
        onBlur={e => saveSummaryNotes(e.target.value)}
        disabled={disabledNotes}
        className="width-widescreen"
      />
    </>
  );
};

export default SummaryNotes;
