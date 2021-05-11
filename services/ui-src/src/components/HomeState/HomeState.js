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
    let x = 0;
    try {
      // Get user information
      const AuthUserInfo = (await Auth.currentSession()).getIdToken();
      currentUserInfo = await obtainUserByEmail({
        email: AuthUserInfo.payload.email
      });
    } catch (e) {
      onError(e);
    }

    let y = 0;
    let forms = [];
    let stateString = "";

    if (currentUserInfo["Items"]) {
      // Get list of all state forms
      try {
        const availableForms = await obtainAvailableForms({
          stateId: currentUserInfo["Items"][0].states[0]
        });
        forms = sortFormsByYearAndQuarter(forms);
        stateString = currentUserInfo["Items"][0].states[0];
      } catch (error) {
        console.log("NEEDLE IN THE HAYSTACK", error);
      }
    }

    let yyy = 0;
    return {
      // Sort forms descending by year and then quarter and return them along with user state
      forms: forms === [] ? [] : sortFormsByYearAndQuarter(forms),
      stateString: stateString === "" ? "" : stateString
    };
  };

  useEffect(() => {
    (async () => {
      let a = 0;
      const { forms, stateString } = await loadUserData();

      console.log(
        "FORMS AND STATE STRING??? \n\n\n",
        forms,
        "\n\n\n",
        stateString
      );

      let b = 0;
      if (stateString !== "") {
        let c = 0;
        setAccordionItems(
          buildSortedAccordionByYearQuarter(forms, stateString)
        );
      } else {
        let d = 0;
        history.push("/register-state");
      }
      let gg = 0;
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
