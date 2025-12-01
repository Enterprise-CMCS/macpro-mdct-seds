import React, { useEffect, useState } from "react";
import "./NotApplicable.scss";
import { getUserInfo } from "../../utility-functions/userFunctions";
import {
  InProgressStatusFields,
  isFinalCertified,
  isNotRequired,
  NotRequiredStatusFields,
} from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

const NotApplicable = () => {
  const statusData = useStore(state => state.statusData);
  const resetData = useStore(state => state.wipeForm);
  const saveForm = useStore(state => state.saveForm);
  const updateFormStatus = useStore(state => state.updateFormStatus);

  const [inputDisabled, setInputDisabled] = useState(true);

  useEffect(() => {
    if (isFinalCertified(statusData)) {
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
  }, [statusData]);

  const handleApplicableChange = async (evt) => {
    // TODO: Clean up these objects - just use status_id instead.
    const newStatusData = evt.target.value === "Yes"
      ? InProgressStatusFields()
      : NotRequiredStatusFields();

    if (isNotRequired(newStatusData)) {
      const confirm = window.confirm(
        `Are you sure you do not want to complete this form? Any data you entered will be lost.`
      );
      if (confirm) {
        await resetData();
      } else {
        return;
      }
    }

    await updateFormStatus(newStatusData.status_id);
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
            checked={!isNotRequired(statusData)}
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
            checked={isNotRequired(statusData)}
            onChange={handleApplicableChange}
          />
          <label className="usa-radio__label" htmlFor="applicable-no">No</label>
        </div>
      </fieldset>
    </div>
  );
};

export default NotApplicable;
