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

const NotApplicable = ({
  notApplicable,
  status,
  statusId,
  updatedApplicableStatus,
  resetData,
  statusTypes
}) => {
  const [username, setUsername] = useState();
  const [applicableStatus, setApplicableStatus] = useState(1); // 0 or 1
  const [disableSlider, setDisableSlider] = useState(); // Should the slider be disabled?

  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

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
    const booleanToInteger = notApplicable ? 1 : 0;
    setApplicableStatus(booleanToInteger);

    if (statusId === 4) {
      setDisableSlider(true);
    }
  }, [notApplicable, status, statusId, updatedApplicableStatus]);

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
    const invertedStatus = statusId === 5 ? 2 : 5;

    const newStatusString = statusTypes.find(
      element => element.status_id === invertedStatus
    );
    console.log("NEW STATUS STRING", newStatusString);

    setApplicableStatus(applicableStatus === 0 ? 1 : 0);
    updatedApplicableStatus(
      invertIntegerToBoolean,
      username,
      newStatusString.status,
      invertedStatus
    );
  };

  return (
    <div className="padding-x-5" data-test="applicable-wrapper">
      <h3 className="padding-x-5" data-test="applicable-prompt">
        Does this form apply to your state?
      </h3>
      <div
        className="padding-x-5 applicable-slider"
        data-test="applicable-slider"
      >
        <p
          className={
            applicableStatus === 0 ? "applicable-selected is-selected" : null
          }
          data-test="applicable-selected"
        >
          Active
        </p>

        <RangeInput
          onChange={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          value={applicableStatus}
          color="red"
          list="range-list-id"
          disabled={disableSlider}
          data-test="slider-input"
        />

        <p
          className={
            applicableStatus === 1
              ? "not-applicable-selected is-selected"
              : null
          }
          data-test="not-applicable-selected"
        >
          {" "}
          Not Applicable
        </p>
      </div>
    </div>
  );
};

NotApplicable.propTypes = {
  notApplicable: PropTypes.bool,
  status: PropTypes.string.isRequired,
  statusId: PropTypes.number.isRequired,
  updatedApplicableStatus: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired,
  statusTypes: PropTypes.array.isRequired
};

const mapState = state => ({
  notApplicable: state.currentForm.statusData.not_applicable,
  status: state.currentForm.statusData.status || "",
  statusId: state.currentForm.statusData.status_id || "",
  statusTypes: state.global.status
});

const mapDispatch = {
  updatedApplicableStatus: updatedApplicableStatus,
  resetData: clearFormData
};

export default connect(mapState, mapDispatch)(NotApplicable);
