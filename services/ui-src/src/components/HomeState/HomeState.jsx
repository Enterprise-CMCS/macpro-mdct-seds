import React, { useState, useEffect } from "react";
import { Accordion } from "@trussworks/react-uswds";
import { useHistory } from "react-router-dom";
import { obtainAvailableForms } from "../../libs/api";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter
} from "../../utility-functions/sortingFunctions";
import { useStore } from "../../store/store";

const HomeState = () => {
  const user = useStore(state => state.user);
  const [accordionItems, setAccordionItems] = useState([]);
  let history = useHistory();

  const loadForms = async (stateId) => {
    try {
      const availableForms = await obtainAvailableForms({ stateId });
      return sortFormsByYearAndQuarter(availableForms);
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      const stateString = user.states?.[0];

      if (stateString) {
        const forms = await loadForms(stateString);
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
