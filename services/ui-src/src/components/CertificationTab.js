import React from "react";
import { connect } from "react-redux";
import "react-tabs/style/react-tabs.css";
import { Button } from "@trussworks/react-uswds";
import { certifyAndSubmit } from "../store/actions/certify";

const CertificationTab = ({
  status,
  notApplicable,
  lastModified,
  lastModifiedBy,
  isCertified,
  certifyAndSubmit
}) => {
  return (
    <>
      <h3> Certify and Submit</h3>
      {isCertified ? (
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
          <Button onClick={() => certifyAndSubmit()} type="button">
            Certify and Submit
          </Button>
        </>
      )}

      <div>
        <b>What to expect next:</b>
        <p>
          You‘ll hear from CMS if they have any questions about your report.
        </p>
      </div>
    </>
  );
};

const mapState = state => ({
  status: state.currentForm.status,
  notApplicable: state.currentForm.not_applicable,
  lastModified: state.currentForm.last_modified,
  lastModifiedBy: state.currentForm.last_modified_by,
  isCertified: state.currentForm.status === "final"
});

const mapDispatch = {
  certifyAndSubmit
};
export default connect(mapState, mapDispatch)(CertificationTab);
