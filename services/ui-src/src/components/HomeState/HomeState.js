import React, { useState, useEffect } from "react";
import { Accordion } from "@trussworks/react-uswds";
import { useHistory } from "react-router-dom";
import { obtainUserByEmail, obtainAvailableForms } from "../../libs/api";
import { Auth } from "aws-amplify";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";

const HomeState = () => {
  // Set up local state
  const [accordionItems, setAccordionItems] = useState([]);
  let history = useHistory();

  // Get User data
  const loadUserData = async () => {
    // Get user data via email from amplify
    const AuthUserInfo = await Auth.currentAuthenticatedUser();

    // const AuthUserInfo = (await Auth.currentSession()).getIdToken;
    // let email = AuthUserInfo.payload.email;

    let email;

    console.log(AuthUserInfo);

    if (AuthUserInfo.attributes && AuthUserInfo.attributes.email) {
      email = AuthUserInfo.attributes.email;
    } else {
      email = AuthUserInfo.signInUserSession.idToken.payload.email;
    }

    console.log("Retrieved email: -----");
    console.log(email);

    const currentUserInfo = await obtainUserByEmail({
      email: email
    });

    // Get list of all state forms
    const forms = await obtainAvailableForms({
      stateId: currentUserInfo.Items[0].states[0]
    });

    // Sort forms descending by year and then quarter and return them along with user state
    return {
      forms: sortFormsByYearAndQuarter(forms),
      stateString: currentUserInfo.Items[0].states[0]
    };
  };

  useEffect(() => {
    (async () => {
      const { forms, stateString } = await loadUserData();
      if (stateString !== "null" && forms && forms !== []) {
        setAccordionItems(
          buildSortedAccordionByYearQuarter(forms, stateString)
        );
      } else {
        history.push("/register-state");
      }
    })();
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
