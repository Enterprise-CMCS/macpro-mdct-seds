import React, { useState, useEffect } from "react";
import { Accordion } from "@trussworks/react-uswds";
import { obtainUserByEmail, obtainAvailableForms } from "../../libs/api";
import { Auth } from "aws-amplify";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";
import { onError } from "../../libs/errorLib";

const HomeState = () => {
  // Set up local state
  const [state, setState] = useState();
  const [formData, setFormData] = useState();

  // Get User data
  const loadUserData = async () => {
    // Get user information
    let currentUserInfo;
    try {
      // Get user information
      const AuthUserInfo = (await Auth.currentSession()).getIdToken();
      currentUserInfo = await obtainUserByEmail({
        email: AuthUserInfo.payload.email
      });
    } catch (e) {
      onError(e);
    }

    if (currentUserInfo["Items"]) {
      // Save to local state
      setState(currentUserInfo["Items"][0].states[0]);

      // Get list of all state forms
      const forms = await obtainAvailableForms({
        stateId: currentUserInfo["Items"][0].states[0]
      });

      // Sort forms by Year and Quarter and set to local state
      setFormData(sortFormsByYearAndQuarter(forms));
    }
  };
  useEffect(() => {
    loadUserData().then();
  }, []);

  // Create an array of unique years
  let accordionItems = buildSortedAccordionByYearQuarter(formData, state);

  return (
    <div className="page-home-state">
      {accordionItems.length !== 0 ? (
        <>
          <p className="instructions">
            Welcome to SEDS! Please select a Federal Fiscal Year and quarter
            below to view available reports.
          </p>

          <div className="quarterly-report-list">
            <Accordion bordered={true} items={accordionItems} />
          </div>
        </>
      ) : (
        <>
          <h1>Insufficient Privileges</h1>
          <p>This account is not associated with any states.</p>
          <p>
            If you feel this is an error, please contact the helpdesk{" "}
            <a href="mailto:sedshelp@cms.hhs.gov">SEDSHelp@cms.hhs.gov</a>
          </p>
        </>
      )}
    </div>
  );
};

export default HomeState;
