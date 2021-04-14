import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import { updatedStatus } from "../../store/reducers/singleForm/singleForm";
import { Auth } from "aws-amplify";

const NotApplicable = ({ not_applicable, status, toggle }) => {
  const [username, setUsername] = useState();
  const [applicableStatus, setApplicableStatus] = useState(); // 0 or 1
  const [currentStatus, setCurrentStatus] = useState(); // status description
  const [disableSlider, setDisableSlider] = useState(); // should the slider be killed

  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

  // Status constants in lieu of IDS
  const inProgress = "In Progress";
  const final = "Final Data Certified and Submitted";
  const notRequired = "Not Required";

  useEffect(() => {
    const loadUserData = async () => {
      const AuthUserInfo = await Auth.currentAuthenticatedUser();
      const { given_name, family_name } = AuthUserInfo.attributes;
      setUsername(`${given_name} ${family_name}`);
    };
    loadUserData();
  });

  useEffect(() => {
    const booleanToInteger = not_applicable ? 1 : 0;
    setApplicableStatus(booleanToInteger);

    if (status === final) {
      setDisableSlider(true);
    }
  }, [not_applicable, status, toggle]);

  const changeStatus = () => {
    const confirm = window.confirm(
      `Are you sure you do not want to complete this form? Any data you entered will be lost. Select cancel to revert your selection`
    );
    if (confirm) {
      const invertIntegerToBoolean = applicableStatus === 0 ? true : false;
      const invertedStatus =
        currentStatus === notRequired ? inProgress : notRequired;
      toggle(invertIntegerToBoolean, username, invertedStatus);
    }
  };

  return (
    <>
      <h3 data-test="applicable-prompt">Does this form apply to your state?</h3>
      <h2 data-test="applicable-status">
        {applicableStatus === 0 ? <p>Active</p> : <p> Not Applicable</p>}{" "}
      </h2>
      <p>
        <RangeInput
          onClick={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          value={applicableStatus}
          list="range-list-id"
          style={{ width: 100 }}
          disabled={disableSlider}
          data-test="applicable-slider"
        />
      </p>
    </>
  );
};

NotApplicable.propTypes = {
  not_applicable: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired
};

const mapState = state => ({
  not_applicable: state.currentForm.statusData.not_applicable,
  status: state.currentForm.statusData.status
});

const mapDispatch = {
  toggle: updatedStatus
};

export default connect(mapState, mapDispatch)(NotApplicable);

//TODO:

// Selecting “Not applicable” triggers a prompt (pop up window), all your data will be lost.

//QUESTIONS:
// — Re selecting applicable changes form status back to “in progress”?
// Is a pop up window really the way to go? maybe we use a trussworks alert component
// DO WE WANT TO CLEAR THEIR INPUT WHEN THE STATUS IS CHANGED TO DISABLED??
// ???? should this Trigger a save??

// NOTES:
// THIS MUST MUST MUST DISABLE THE CERTIFICATION  ABILITIES

//
// const [applicableStatus, setApplicableStatus] = useState(); // 0 or 1
// const [currentStatus, setCurrentStatus] = useState(); // status description

// const { not_applicable, status } = props;

// // FALSE = the form APPLIES TO THIS STATE (0)
// // TRUE = the form is NOT APPLICABLE (1)

// // Status constants in lieu of IDS
// const notStarted = "Not Started";
// const inProgress = "In Progress";
// const final = "Final Data Certified and Submitted";
// const notRequired = "Not Required";
// const provisional = "Provisional Data Certified and Submitted";

// useEffect(() => {
//   console.log("PROPS????", props);
//   const booleanToInteger = not_applicable ? 1 : 0; // translate redux values into local state
//   const tempStatus = "".concat(status);
//   setApplicableStatus(booleanToInteger); // set integer to local state [WORKING]
//   setCurrentStatus(tempStatus); // set current status description to state [NOT WORKING]
// }, []);

// console.log("STILL??????", currentStatus);
