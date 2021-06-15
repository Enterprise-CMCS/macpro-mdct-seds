import React, { useState, useEffect } from "react";
import { Accordion } from "@trussworks/react-uswds";
import { useHistory } from "react-router-dom";
import { obtainUserByEmail, obtainAvailableForms } from "../../libs/api";
import { Auth } from "aws-amplify";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";
import { onError } from "../../libs/errorLib";

const HomeState = () => {
  const [accordionItems, setAccordionItems] = useState([]);
  let history = useHistory();

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

    let forms = [];
    let stateString = "";

    if (currentUserInfo["Items"]) {
      // Get list of all state forms
      try {
        const availableForms = await obtainAvailableForms({
          stateId: currentUserInfo["Items"][0].states[0]
        });
        forms = sortFormsByYearAndQuarter(availableForms);
        stateString = currentUserInfo["Items"][0].states[0];
      } catch (error) {
        console.log(error);
      }
    }

    return {
      // Sort forms descending by year and then quarter and return them along with user state
      forms: forms.legnth === 0 ? [] : forms,
      stateString: stateString === "" ? "" : stateString
    };
  };

  useEffect(() => {
    (async () => {
      const { forms, stateString } = await loadUserData();

      if (stateString) {
        setAccordionItems(
          buildSortedAccordionByYearQuarter(forms, stateString)
        );
      } else {
        history.push("/register-state");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page-home-state">
      <p className="instructions">
        Welcome to SEDS! Please select a Federal Fiscal Year and quarter below
        to view available reports.
      </p>

      <div className="quarterly-report-list">
        <Accordion bordered={true} items={accordionItems} />
      </div>
    </div>
  );
};

export default HomeState;
