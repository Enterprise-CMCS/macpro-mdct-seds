import React from "react";
import "./NotApplicable.scss";
import {
  InProgressStatusFields,
  isFinalCertified,
  isNotRequired,
  NotRequiredStatusFields,
} from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

const NotApplicable = () => {
  const userRole = useStore((state) => state.user.role);
  const statusData = useStore((state) => state.statusData);
  const resetData = useStore((state) => state.wipeForm);
  const saveForm = useStore((state) => state.saveForm);
  const updateFormStatus = useStore((state) => state.updateFormStatus);

  const inputDisabled = userRole !== "state" || isFinalCertified(statusData);

  const handleApplicableChange = async (evt) => {
    // TODO: Clean up these objects - just use status_id instead.
    const newStatusData =
      evt.target.value === "Yes"
        ? InProgressStatusFields()
        : NotRequiredStatusFields();

    if (isNotRequired(newStatusData)) {
      const confirm = window.confirm(
        `Are you sure you do not want to complete this form? Any data you entered will be lost.`
      );
      if (confirm) {
        resetData();
      } else {
        return;
      }
    }

    updateFormStatus(newStatusData.status_id);
    await saveForm();
  };

  return (
    <div className="applicable-wrapper">
      <fieldset className="usa-fieldset">
        <legend className="usa-legend usa-legend">
          Does this form apply to your state?
        </legend>
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id="applicable-yes"
            type="radio"
            name="not-applicable"
            value="Yes"
            disabled={inputDisabled}
            checked={!isNotRequired(statusData)}
            onChange={handleApplicableChange}
          />
          <label className="usa-radio__label" htmlFor="applicable-yes">
            Yes
          </label>
        </div>
        <div className="usa-radio">
          <input
            className="usa-radio__input"
            id="applicable-no"
            type="radio"
            name="not-applicable"
            value="No"
            disabled={inputDisabled}
            checked={isNotRequired(statusData)}
            onChange={handleApplicableChange}
          />
          <label className="usa-radio__label" htmlFor="applicable-no">
            No
          </label>
        </div>
      </fieldset>
    </div>
  );
};

export default NotApplicable;
