import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { RangeInput } from "@trussworks/react-uswds";
import PropTypes from "prop-types";
import {
  updateFormStatusThunk,
  clearFormData,
  saveForm
} from "../../store/reducers/singleForm/singleForm";
import "./NotApplicable.scss";
import { getUserInfo } from "../../utility-functions/userFunctions";

const NotApplicable = ({
  status_id,
  resetData,
  saveForm,
  updateFormStatusThunk
}) => {
  const [applicableStatus, setApplicableStatus] = useState(
    (status_id === 4) ? 1 : 0
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
    const booleanToInteger = (status_id === 4) ? 1 : 0;
    setApplicableStatus(booleanToInteger);
    determineUserRole().then();

    if (status_id === 3) {
      setDisableSlider(true);
    }
  }, [status_id]);

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

    const invertedStatus = status_id === 4 ? 1 : 4;

    setApplicableStatus(applicableStatus === 0 ? 1 : 0);
    await updateFormStatusThunk(
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
  status_id: PropTypes.number.isRequired,
  resetData: PropTypes.func.isRequired,
  saveForm: PropTypes.func.isRequired,
  updateFormStatusThunk: PropTypes.func.isRequired
};

const mapState = state => ({
  status_id: state.currentForm.statusData.status_id,
});

const mapDispatch = {
  resetData: clearFormData,
  saveForm: saveForm,
  updateFormStatusThunk: updateFormStatusThunk
};

export default connect(mapState, mapDispatch)(NotApplicable);
