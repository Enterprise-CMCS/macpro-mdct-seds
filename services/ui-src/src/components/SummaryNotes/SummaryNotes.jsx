import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Textarea } from "@trussworks/react-uswds";
import { saveSummaryNotes } from "../../store/actions/statusData";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { FormStatus } from "../../libs/types";

const SummaryNotes = ({ statusData, saveSummaryNotes }) => {
  const [summaryNotes, setSummaryNotes] = useState([]);
  const [userRole, setUserRole] = useState();

  let currentSummaryNotes;
  let disabledNotes = false;

  // Summary tab will load before statusData is populated and this prevents an error
  if (statusData.state_comments !== undefined) {
    currentSummaryNotes = statusData.state_comments[0].entry;
  }

  // Set the initial state of the summary notes
  useEffect(() => {
    const disableNotes = async () => {
      let existingUser = await getUserInfo();
      const userdata = existingUser["Items"];
      userdata.map(async userInfo => {
        setUserRole(userInfo.role);
      });
    };
    disableNotes();
    setSummaryNotes(currentSummaryNotes);
  }, [currentSummaryNotes, statusData]);

  // Update summary notes object locally and in redux
  const updateTempSummaryNotes = e => {
    setSummaryNotes(e.target.value);
  };
  if (
    userRole === "admin" ||
    userRole === "business" ||
    statusData.status_id === FormStatus.FinalCertified
  ) {
    disabledNotes = true;
  }

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

SummaryNotes.propTypes = {
  statusData: PropTypes.object.isRequired
};

const mapState = state => ({
  statusData: state.currentForm.statusData,
  saveSummaryNotes: state.currentForm.statusData.state_comments
});

const mapDispatch = {
  saveSummaryNotes
};

export default connect(mapState, mapDispatch)(SummaryNotes);
