import React, { useState } from "react";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import { Button, Alert } from "@trussworks/react-uswds";
import {
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional,
  uncertify
} from "../../store/actions/certify";
import PropTypes from "prop-types";
import "./CertificationTab.scss";
import { dateFormatter } from "../../utility-functions/sortingFunctions";
import { saveForm } from "../../store/reducers/singleForm/singleForm";

const CertificationTab = ({
  status,
  notApplicable,
  lastModified,
  lastModifiedBy,
  isFinal,
  isProvisional,
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional,
  uncertify,
  saveForm
}) => {
  const [provisionalButtonStatus, setprovisionalButtonStatus] = useState(
    isFinal === true ? true : isProvisional
  );
  const [finalButtonStatus, setfinalButtonStatus] = useState(isFinal);

  const submitProvisional = async () => {
    await certifyAndSubmitProvisional();
    saveForm();
    setprovisionalButtonStatus(true);
  };
  const submitFinal = () => {
    certifyAndSubmitFinal();
    setprovisionalButtonStatus(true);
    setfinalButtonStatus(true);
    saveForm();
  };
  const submitUncertify = async () => {
    if (window.confirm("Are you sure you want to uncertify this report?")) {
      await uncertify();
      saveForm();
      setprovisionalButtonStatus(false);
      setfinalButtonStatus(false);
    }
  };

  let certifyText;
  if (isFinal) {
    certifyText = (
      <div data-testid="certificationText" className="padding-y-2">
        <b> Thank you for submitting your SEDS data!</b>
      </div>
    );
  } else if (isProvisional) {
    certifyText = (
      <div data-testid="certificationText" className="padding-y-2">
        <b>Ready to final certify?</b>
      </div>
    );
  } else {
    certifyText = (
      <div data-testid="certificationText" className="padding-y-2">
        <b>Ready to certify?</b>
      </div>
    );
  }
  return (
    <div className="react-transition fade-in">
      {isFinal ? (
        <div className="padding-y-2">
          <Alert
            type="success"
            heading="Thank you for submitting your SEDS data!"
          >
            <b> What to expect next:</b> You will hear from CMS if they have any
            questions about your report.
          </Alert>
        </div>
      ) : null}

      {isProvisional ? (
        <div className="padding-y-2">
          <Alert
            type="info"
            heading="You have submitted provisional SEDS data"
          />
        </div>
      ) : null}

      <div className="age-range-description padding-y-2">
        <h3>Certify and Submit:</h3>
      </div>
      {certifyText}
      <div className="padding-top-3">
        <p>
          Certify & Submit Provisional Data will allow you to submit your form
          now, but it will remain editable to allow you to submit final data.
        </p>
        <p>
          Once you have reviewed your report, certify that it’s accurate and in
          compliance with Title XXI of the Social Security Act (Section 2109(a)
          and Section 2108(e)).
        </p>
        {isFinal || isProvisional ? (
          <div data-testid="statusText">
            <p>
              This report was updated to <b>{status}</b> on{" "}
              <b>{dateFormatter(lastModified)}</b> by <b>{lastModifiedBy}</b>
            </p>
          </div>
        ) : null}
      </div>
      <div className="certify-btn ">
        <Button
          onClick={() => submitProvisional()}
          type="button"
          disabled={provisionalButtonStatus}
        >
          {"Certify & Submit Provisional Data"}
        </Button>
        <Button
          onClick={() => submitFinal()}
          type="button"
          disabled={finalButtonStatus}
        >
          {"Certify & Submit Final Data"}
        </Button>
      </div>
      {isFinal ? (
        <div className="certify-btn uncertify">
          <Button onClick={() => submitUncertify()} type="button">
            {"Uncertify"}
          </Button>
        </div>
      ) : null}
      <p className="padding-top-3">
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

CertificationTab.propTypes = {
  certifyAndSubmitFinal: PropTypes.func.isRequired,
  certifyAndSubmitProvisional: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  notApplicable: PropTypes.bool.isRequired,
  lastModified: PropTypes.string.isRequired,
  lastModifiedBy: PropTypes.string,
  isFinal: PropTypes.bool.isRequired,
  isProvisional: PropTypes.bool.isRequired,
  saveForm: PropTypes.func.isRequired
};

const mapState = state => ({
  status: state.currentForm.statusData.status,
  notApplicable: state.currentForm.statusData.not_applicable,
  lastModified: state.currentForm.statusData.status_date,
  lastModifiedBy: state.currentForm.statusData.status_modified_by,
  isFinal: state.currentForm.statusData.status_id === 4,
  isProvisional: state.currentForm.statusData.status_id === 3
});

const mapDispatch = {
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional,
  uncertify,
  saveForm
};
export default connect(mapState, mapDispatch)(CertificationTab);
