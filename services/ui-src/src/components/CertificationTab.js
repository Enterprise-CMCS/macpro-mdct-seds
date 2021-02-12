import React, { useState } from "react";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import { Button, Alert, GridContainer, Grid } from "@trussworks/react-uswds";
import {
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional
} from "../store/actions/certify";
import PropTypes from "prop-types";

const CertificationTab = ({
  status,
  notApplicable,
  lastModified,
  lastModifiedBy,
  isFinal,
  isProvisional,
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional
}) => {
  const [provisionalButtonStatus, setprovisionalButtonStatus] = useState(
    isFinal === true ? true : isProvisional
  );
  const [finalButtonStatus, setfinalButtonStatus] = useState(isFinal);

  const submitProvisional = () => {
    certifyAndSubmitProvisional();
    setprovisionalButtonStatus(true);
  };
  const submitFinal = () => {
    certifyAndSubmitFinal();
    setprovisionalButtonStatus(true);
    setfinalButtonStatus(true);
  };

  return (
    <>
      {isFinal ? (
        <div>
          <Alert
            type="success"
            heading="Thank you for submitting your SEDs data!"
          >
            <b> What to expect next:</b> You will hear from CMS if they have any
            questions about your report.
          </Alert>
        </div>
      ) : null}

      {isProvisional ? (
        <div>
          <Alert
            type="info"
            heading="You have submitted provisional SEDs data"
          />
        </div>
      ) : null}

      <h3> Certify and Submit</h3>
      {isFinal ? (
        <>
          <b> Thank you for submitting your SEDs data!</b>
          <p>
            Submitted on {lastModified} by {lastModifiedBy}
          </p>
        </>
      ) : (
        <>
          <b>Ready to certify?</b>
          <p>
            Double check that everything in your SEDS report is accurate. You
            won’t be able to make any edits after submitting, unless you send a
            request to CMS to uncertify your report.
          </p>
          <p>
            Once you have reviewed your report, certify that it’s accurate and
            in compliance with Title XXI of the Social Security Act (Section
            2109(a) and Section 2108(e)).
          </p>
        </>
      )}

      <GridContainer>
        <Grid row>
          <Grid col={6} className="certify-btn provisional">
            <Button
              onClick={() => submitProvisional()}
              type="button"
              disabled={provisionalButtonStatus}
            >
              {"Certify & Submit Provisional Data"}
            </Button>
          </Grid>
          <Grid col={6} className="certify-btn final">
            <Button
              onClick={() => submitFinal()}
              type="button"
              disabled={finalButtonStatus}
            >
              {"Certify & Submit Final Data"}
            </Button>
          </Grid>
        </Grid>
      </GridContainer>
    </>
  );
};

CertificationTab.propTypes = {
  certifyAndSubmitFinal: PropTypes.func.isRequired,
  certifyAndSubmitProvisional: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  notApplicable: PropTypes.bool.isRequired,
  lastModified: PropTypes.string.isRequired,
  lastModifiedBy: PropTypes.string,
  isFinal: PropTypes.string.isRequired,
  isProvisional: PropTypes.string.isRequired
};

const mapState = state => ({
  status: state.currentForm.status,
  notApplicable: state.currentForm.not_applicable,
  lastModified: state.currentForm.last_modified,
  lastModifiedBy: state.currentForm.last_modified_by,
  isFinal: state.currentForm.status === "final",
  isProvisional: state.currentForm.status === "provisional"
});

const mapDispatch = {
  certifyAndSubmitFinal,
  certifyAndSubmitProvisional
};
export default connect(mapState, mapDispatch)(CertificationTab);
