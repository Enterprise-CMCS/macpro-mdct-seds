import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import {
  updatedApplicableStatus,
  updatedApplicableThunk,
  clearFormData,
  saveForm
} from "../../store/reducers/singleForm/singleForm";
import "./NotApplicable.scss";
import { getUserInfo } from "../../utility-functions/userFunctions";

const NotApplicable = ({
  notApplicable,
  status,
  statusId,
  updatedApplicableStatus,
  resetData,
  statusTypes,
  saveForm,
  updatedApplicableThunk
}) => {
  const [applicableStatus, setApplicableStatus] = useState(
    notApplicable ? 1 : 0
  );
  const [disableSlider, setDisableSlider] = useState(); // Should the slider be disabled?

  const determineUserRole = async () => {
    const currentUser = await getUserInfo();

    if (
      currentUser.Items &&
      (currentUser.Items[0].role === "admin" ||
        currentUser.Items[0].role === "business")
    ) {
      setDisableSlider(true);
    }
  };

  // FALSE = the form APPLIES TO THIS STATE (0)
  // TRUE = the form is NOT APPLICABLE (1)

  useEffect(() => {
    const booleanToInteger = notApplicable ? 1 : 0;
    setApplicableStatus(booleanToInteger);
    determineUserRole().then();

    if (statusId === 3) {
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
    const invertedStatus = statusId === 4 ? 1 : 4;

    const newStatusObject = statusTypes.find(
      element => element.status_id === invertedStatus
    );

    setApplicableStatus(applicableStatus === 0 ? 1 : 0);
    await updatedApplicableThunk(
      invertIntegerToBoolean,
      newStatusObject.status,
      invertedStatus
    );
    saveForm();
  };

  return (
    <div data-test="applicable-wrapper">
      <h3 data-test="applicable-prompt">Does this form apply to your state?</h3>
      <div className="applicable-slider" data-test="applicable-slider">
        <p
          className={
            applicableStatus === 0 ? "applicable-selected is-selected" : null
          }
        >
          Active
        </p>

        <RangeInput
          onInput={() => changeStatus()}
          id="range-slider"
          name="range"
          min={0}
          max={1}
          value={applicableStatus}
          color="red"
          list="range-list-id"
          disabled={disableSlider}
        />

        <p
          className={
            applicableStatus === 1
              ? "not-applicable-selected is-selected"
              : null
          }
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
  statusTypes: PropTypes.array.isRequired,
  updatedApplicableStatus: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired,
  saveForm: PropTypes.func.isRequired,
  updatedApplicableThunk: PropTypes.func.isRequired
};

const mapState = state => ({
  notApplicable: state.currentForm.statusData.not_applicable,
  status: state.currentForm.statusData.status || "",
  statusId: state.currentForm.statusData.status_id || "",
  statusTypes: state.global.status
});

const mapDispatch = {
  updatedApplicableStatus: updatedApplicableStatus,
  resetData: clearFormData,
  saveForm: saveForm,
  updatedApplicableThunk: updatedApplicableThunk
};

export default connect(mapState, mapDispatch)(NotApplicable);
