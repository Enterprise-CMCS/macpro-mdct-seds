import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import { updatedStatus } from "../../store/reducers/singleForm/singleForm";
import { Auth } from "aws-amplify";

const NotApplicable = ({ toggle, not_applicable, status }) => {
  const [applicableStatus, setApplicableStatus] = useState(0);
  const [username, setUsername] = useState();
  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

  useEffect(() => {
    const loadUserData = async () => {
      const AuthUserInfo = await Auth.currentAuthenticatedUser();
      const { given_name, family_name } = AuthUserInfo.attributes;
      setUsername(`${given_name} ${family_name}`);
    };
    loadUserData();
  });

  useEffect(() => {
    let booleanToInt = not_applicable === false ? 0 : 1;
    setApplicableStatus(booleanToInt);
  }, [not_applicable]);

  const changeStatus = () => {
    // USERS STOP RIGHT HERE
    // THIS IS WHERE WE STOP AND TELL USERS TO CONFIRM THEIR CHOICE BEFORE PRECEEDING
    // IF THEY CANCEL THEIR CHOICE, RETURN OUT OF THIS CHANGE STATUS FUNCTION
    if (applicableStatus === 0) {
      setApplicableStatus(1);
    } else {
      setApplicableStatus(0);
    }

    let updatedStatus =
      status === "Not Required" ? "In Progress" : "Not Required";

    let integerToBool = applicableStatus === 0 ? false : true;
    toggle(integerToBool, username, updatedStatus);
  };

  return (
    <>
      <h3>Does this form apply to your state?</h3>
      <h2>
        {applicableStatus === 0 ? <p>Active</p> : <p> Not Applicable</p>}{" "}
      </h2>
      <>
        <RangeInput
          onClick={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          value={applicableStatus}
          defaultValue={0}
          list="range-list-id"
          style={{ width: 100 }}
        />
      </>
    </>
  );
};

NotApplicable.propTypes = {
  toggle: PropTypes.func.isRequired,
  statusObject: PropTypes.object.isRequired,
  last_modified_by: PropTypes.string.isRequired,
  last_modified: PropTypes.string.isRequired,
  not_applicable: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired
};

const mapState = state => ({
  statusObject: state.currentForm.statusData,
  last_modified_by: state.currentForm.statusData,
  last_modified: state.currentForm.statusData.last_modified,
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
