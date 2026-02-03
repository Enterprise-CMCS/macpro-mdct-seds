import React, { useState } from "react";
import "react-tabs/style/react-tabs.css";
import { Button, Alert } from "@cmsgov/design-system";
import { dateFormatter } from "../../utility-functions/sortingFunctions";
import {
  isFinalCertified,
  isProvisionalCertified,
  getStatusDisplay,
} from "../../utility-functions/formStatus";
import { useStore } from "../../store/store";

const CertificationTab = () => {
  const statusData = useStore((state) => state.statusData);
  const userRole = useStore((state) => state.user.role);
  const updateFormStatus = useStore((state) => state.updateFormStatus);
  const saveForm = useStore((state) => state.saveForm);

  const isProvisional = isProvisionalCertified(statusData);
  const isFinal = isFinalCertified(statusData);

  const [provCertDisabled, setProvCertDisabled] = useState(
    isFinal || isProvisional
  );
  const [finalCertDisabled, setFinalCertDisabled] = useState(isFinal);

  const showCertifyButtons = userRole === "state" || userRole === "business";

  const submitProvisional = async () => {
    // TODO hardcoded status_id; use FormStatus.ProvisionalCertified
    updateFormStatus(2);
    await saveForm();
    setProvCertDisabled(true);
  };
  const submitFinal = async () => {
    // TODO hardcoded status_id; use FormStatus.FinalCertified
    updateFormStatus(3);
    await saveForm();
    setProvCertDisabled(true);
    setFinalCertDisabled(true);
  };
  const submitUncertify = async () => {
    if (window.confirm("Are you sure you want to uncertify this report?")) {
      // TODO hardcoded status_id; use FormStatus.InProgress
      updateFormStatus(1);
      await saveForm();
      // await sendEmailtoBo();
      setProvCertDisabled(false);
      setFinalCertDisabled(false);
    }
  };

  /*
    NOTE: The SEDS business owners have requested that the email flow to users be disabled, but would like to be
    able to re-enable it at a future point (see: https://bit.ly/3w3mVmT). For now, this will be commented out and not removed.
    
    const sendEmailtoBo = async () => {
      if (userRole === "state") {
        await sendUncertifyEmail({ formInfo: formStatus });
      }
    };
  */

  let certifyText;

  if (isFinal) {
    certifyText = (
      <div data-testid="certificationText">
        <b> Thank you for submitting your SEDS data!</b>
      </div>
    );
  } else if (isProvisional) {
    certifyText = (
      <div data-testid="certificationText">
        <b>Ready to final certify?</b>
      </div>
    );
  } else {
    certifyText = (
      <div data-testid="certificationText">
        <b>Ready to certify?</b>
      </div>
    );
  }

  const statusText = (
    <div data-testid="statusText">
      <p>
        This report was updated to <b>{getStatusDisplay(statusData)}</b> on{" "}
        <b>{dateFormatter(statusData.status_date)}</b> by{" "}
        <b>{statusData.status_modified_by}</b>
      </p>
    </div>
  );

  return (
    <div className="flex-col-gap-1half">
      {isFinal ? (
        <div>
          <Alert
            variation="success"
            heading="Thank you for submitting your SEDS data!"
            headingLevel="h1"
          >
            <b> What to expect next:</b> You will hear from CMS if they have any
            questions about your report.
          </Alert>
        </div>
      ) : null}

      {isProvisional ? (
        <div>
          <Alert
            heading="You have submitted provisional SEDS data"
            headingLevel="h1"
          ></Alert>
        </div>
      ) : null}

      <div>
        <h3>Certify and Submit:</h3>
      </div>
      {certifyText}
      <div>
        <p>
          Certify & Submit Provisional Data will allow you to submit your form
          now, but it will remain editable to allow you to submit final data.
        </p>
        <p>
          Once you have reviewed your report, certify that it’s accurate and in
          compliance with Title XXI of the Social Security Act (Section 2109(a)
          and Section 2108(e)).
        </p>
        {isFinal || isProvisional ? statusText : null}
      </div>
      {showCertifyButtons ? (
        <div className="form-button-row">
          <Button
            variation="solid"
            onClick={() => submitProvisional()}
            disabled={provCertDisabled}
          >
            {"Certify & Submit Provisional Data"}
          </Button>
          <Button
            variation="solid"
            onClick={() => submitFinal()}
            disabled={finalCertDisabled}
          >
            {"Certify & Submit Final Data"}
          </Button>
        </div>
      ) : null}
      {isFinal ? (
        <div>
          <Button
            variation="solid"
            type="button"
            onClick={() => submitUncertify()}
          >
            {"Uncertify"}
          </Button>
        </div>
      ) : null}
      <p>
        Certify & Submit Provisional Data will allow you to submit your form
        now, but it will remain editable to allow you to submit final data.
      </p>
      <p>
        Certify & Submit Final Data will submit your data and the form will no
        longer be editable unless you uncertify.
      </p>
    </div>
  );
};

export default CertificationTab;
