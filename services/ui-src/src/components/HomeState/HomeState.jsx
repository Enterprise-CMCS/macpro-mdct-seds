import React, { useState, useEffect } from "react";
import { Accordion } from "@trussworks/react-uswds";
import { useHistory } from "react-router-dom";
import { obtainAvailableForms } from "../../libs/api";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";
import { getUserInfo } from "../../utility-functions/userFunctions";

const HomeState = () => {
  const [accordionItems, setAccordionItems] = useState([]);
  let history = useHistory();

  // Get User data
  const loadUserData = async () => {
    // Get user information
    let currentUserInfo = await getUserInfo();

    let forms = [];
    let stateString = "";

    if (currentUserInfo["Items"]) {
      // Get list of all state forms
      try {
        console.log("currentUserInfo", currentUserInfo);
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
