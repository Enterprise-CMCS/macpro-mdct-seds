import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import TabContainer from "../TabContainer/TabContainer";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

const NotApplicable = ({}) => {
  return (
    <>
      <h2> Not Applicable </h2>
      <RangeInput
        id="range-slider"
        name="range"
        min={0}
        max={1}
        defaultValue={0}
        list="range-list-id"
        style={{ width: 50 }}
      />
      <datalist id="range-list-id">
        <option>0</option>
        <option>1</option>
      </datalist>
    </>
  );
};

// NotApplicable.propTypes = {
//     gridData: PropTypes.array.isRequired,
//     questionID: PropTypes.string.isRequired,
//     setAnswer: PropTypes.func.isRequired,
//     disabled: PropTypes.bool.isRequired
//   };

const mapState = state => ({
  statusData: state.currentForm.statusData
});

const mapDispatch = {};

export default connect(mapState, mapDispatch)(NotApplicable);

//TODO:

// Make slider “Does this form apply to your state”, initially set to “Applicable”
// props to play with: draggable,

// Should be accessing/connected to the statusData object

// Need user data
// —
// Selecting “Not applicable” triggers a prompt (pop up window), all your data will be lost.

// Change status of form in statusData reducer

// Save user’s name

// Send crazy big array of null values? To reset? Or will disable reset?

// The form should become disabled as soon as that prop is set to disabled or whatever

// Trigger a save??
// — Re selecting applicable changes form status back to “in progress”

// Change status of form in statusData reducer

// Save user’s name

// Form should now be totally editable

//QUESTIONS: Is a pop up window really the way to go? maybe we use a trussworks alert component
