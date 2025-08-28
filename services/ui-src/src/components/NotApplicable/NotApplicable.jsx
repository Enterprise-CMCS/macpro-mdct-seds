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
  const [inputDisabled, setInputDisabled] = useState(true);

  useEffect(() => {
    if (status_id === 3) {
      // This cannot be changed after a form is Final Certified.
      setInputDisabled(true);
      return;
    }

    (async () => {
      const currentUser = await getUserInfo();
      if (currentUser.Items?.[0].role === "state") {
        // This cannot be changed by admin or business users.
        setInputDisabled(false);
      } else {
        setInputDisabled(true);
      }
    })()
  }, [status_id]);

  const handleApplicableChange = async (evt) => {
    const newStatus = evt.target.value === "Yes"
      ? 1 // "In Progress"
      : 4; // "Not Applicable"

    if (newStatus === 4) {
      const confirm = window.confirm(
        `Are you sure you do not want to complete this form? Any data you entered will be lost.`
      );
      if (confirm) {
        await resetData();
      } else {
        return;
      }
    }

    await updateFormStatusThunk(newStatus);
    saveForm();
  };

  return (
    <div className="applicable-wrapper">
      <fieldset className="usa-fieldset">
        <legend className="usa-legend usa-legend">Does this form apply to your state?</legend>
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id="applicable-yes"
            type="radio"
            name="not-applicable"
            value="Yes"
            disabled={inputDisabled}
            checked={status_id !== 4}
            onChange={handleApplicableChange}
          />
          <label className="usa-radio__label" htmlFor="applicable-yes">Yes</label>
        </div>
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id="applicable-no"
            type="radio"
            name="not-applicable"
            value="No"
            disabled={inputDisabled}
            checked={status_id === 4}
            onChange={handleApplicableChange}
          />
          <label className="usa-radio__label" htmlFor="applicable-no">No</label>
        </div>
      </fieldset>
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
