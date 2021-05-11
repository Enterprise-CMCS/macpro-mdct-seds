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
  // Set up local state
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

    if (currentUserInfo["Items"]) {
      // Get list of all state forms
      const forms = await obtainAvailableForms({
        stateId: currentUserInfo["Items"][0].states[0]
      });

      // Sort forms descending by year and then quarter and return them along with user state
      return {
        forms: sortFormsByYearAndQuarter(forms),
        stateString: currentUserInfo["Items"][0].states[0]
      };
    }
  };

  useEffect(() => {
    (async () => {
      let a = 0;
      const { forms, stateString } = await loadUserData();

      let b = 0;
      if (stateString !== "null" && forms && forms !== []) {
        let c = 0;
        console.log(
          "FORMS AND STATE STRING??? \n\n\n",
          forms,
          "\n\n",
          stateString
        );
        setAccordionItems(
          buildSortedAccordionByYearQuarter(forms, stateString)
        );
      } else {
        history.push("/register-state");
      }
    })();
    console.log("HELLO HELLPO HELLO");
  }, []);

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
