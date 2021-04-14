import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import {
  updatedApplicableStatus,
  clearFormData
} from "../../store/reducers/singleForm/singleForm";
import { Auth } from "aws-amplify";
import "./NotApplicable.scss";

const NotApplicable = ({ not_applicable, status, toggle, resetData }) => {
  const [username, setUsername] = useState();
  const [applicableStatus, setApplicableStatus] = useState(); // 0 or 1
  const [disableSlider, setDisableSlider] = useState(); // Should the slider be disabled?

  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

  // Status constants in lieu of IDS
  const inProgress = "In Progress";
  const final = "Final Data Certified and Submitted";
  const notRequired = "Not Required";

  // Fetch a user's name
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

  const changeStatus = async () => {
    if (applicableStatus === 0) {
      const confirm = window.confirm(
        `Are you sure you do not want to complete this form? Any data you entered will be lost.`
      );
      if (confirm) {
        await resetData();
      } else {
        return;
      }
    }
    const invertIntegerToBoolean = applicableStatus === 0 ? true : false;
    const invertedStatus = status === notRequired ? inProgress : notRequired;
    toggle(invertIntegerToBoolean, username, invertedStatus);
  };

  return (
    <div className="padding-x-5">
      <h3 className="padding-x-5" data-test="applicable-prompt">
        Does this form apply to your state?
      </h3>
      <div className="padding-x-5 applicable-slider">
        <p className={applicableStatus === 0 ? "is-selected" : null}>Active</p>

        <RangeInput
          onClick={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          value={applicableStatus}
          list="range-list-id"
          disabled={disableSlider}
          class="slider"
        />

        <p className={applicableStatus === 1 ? "is-selected" : null}>
          {" "}
          Not Applicable
        </p>
      </div>
    </div>
  );
};

NotApplicable.propTypes = {
  not_applicable: PropTypes.bool.isRequired,
  status: PropTypes.string.isRequired,
  answers: PropTypes.array.isRequired,
  toggle: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired
};

const mapState = state => ({
  not_applicable: state.currentForm.statusData.not_applicable,
  status: state.currentForm.statusData.status,
  answers: state.currentForm.answers
});

const mapDispatch = {
  toggle: updatedApplicableStatus,
  resetData: clearFormData
};

export default connect(mapState, mapDispatch)(NotApplicable);

// NOTES:
// THIS MUST MUST MUST DISABLE THE CERTIFICATION  ABILITIES
// ???? should this Trigger a save??
