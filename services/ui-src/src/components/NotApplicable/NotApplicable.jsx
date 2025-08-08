import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  updateFormStatusThunk,
  clearFormData,
  saveForm
} from "../../store/reducers/singleForm/singleForm";
import "./NotApplicable.scss";
import { getUserInfo } from "../../utility-functions/userFunctions";
import { FormStatus, UserRole } from "../../utility-functions/types";

const NotApplicable = ({
  status_id,
  updateFormStatusThunk,
  clearFormData,
  saveForm,
}) => {
  const [disableInput, setDisableInput] = useState(true);

  useEffect(() => {
    if (status_id === FormStatus.FinalCertified) {
      setDisableInput(true);
      return;
    }

    (async () => {
      const currentUser = await getUserInfo();
      if (
        currentUser.Items &&
        currentUser.Items[0].role === UserRole.State
      ) {
        // Only state users are allowed to change this.
        setDisableInput(false);
      }
    })();

  }, [status_id]);

  const handleApplicableChange = async (evt) => {
    const newStatus = evt.target.value === "Yes"
      ? FormStatus.InProgress // Displays as "In Progress"
      : FormStatus.NotApplicable; // Displays as "Not Required"
    
    if (newStatus === FormStatus.NotApplicable) {
      const confirm = window.confirm(
        `Are you sure you do not want to complete this form? Any data you entered will be lost.`
      );
      if (confirm) {
        await clearFormData();
      } else {
        return;
      }
    }

    await updateFormStatusThunk(newStatus);
    saveForm();
  }

  return (
    <div className="applicable-wrapper">
      <fieldset className="usa-fieldset">
        <legend className="usa-legend">
          Does this form apply to your state?
        </legend>
        
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id="applicable-yes"
            type="radio"
            name="applicable-radio"
            value="Yes"
            disabled={disableInput}
            checked={status_id !== FormStatus.NotApplicable}
            onChange={handleApplicableChange}
          />
          <label
            className="usa-radio__label"
            htmlFor="applicable-yes"
          >
            Yes
          </label>
        </div>
        
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id="applicable-no"
            type="radio"
            name="applicable-radio"
            value="Not Applicable"
            disabled={disableInput}
            checked={status_id === FormStatus.NotApplicable}
            onChange={handleApplicableChange}
          />
          <label
            className="usa-radio__label"
            htmlFor="applicable-no"
          >
            No
          </label>
        </div>
      </fieldset>
    </div>
  );
};

NotApplicable.propTypes = {
  status_id: PropTypes.number.isRequired,
  updateFormStatusThunk: PropTypes.func.isRequired,
  clearFormData: PropTypes.func.isRequired,
  saveForm: PropTypes.func.isRequired,
};

const mapState = state => ({
  status_id: state.currentForm.statusData.status_id,
});

const mapDispatch = {
  updateFormStatusThunk: updateFormStatusThunk,
  clearFormData: clearFormData,
  saveForm: saveForm,
}

export default connect(mapState, mapDispatch)(NotApplicable);
