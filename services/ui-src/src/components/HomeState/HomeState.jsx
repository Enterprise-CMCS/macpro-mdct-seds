import React, { useState, useEffect } from "react";
import { Accordion } from "@trussworks/react-uswds";
import { useHistory } from "react-router-dom";
import { listFormsForState } from "../../libs/api";
import {
  sortFormsByYearAndQuarter,
  buildSortedAccordionByYearQuarter,
} from "../../utility-functions/sortingFunctions";
import { useStore } from "../../store/store";

const HomeState = () => {
  const user = useStore((state) => state.user);
  const [accordionItems, setAccordionItems] = useState([]);
  let history = useHistory();

  const loadForms = async (stateId) => {
    try {
      const availableForms = await listFormsForState(stateId);
      return sortFormsByYearAndQuarter(availableForms);
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      if (!user.state) {
        history.push("/register-state");
      }

      const forms = await loadForms(user.state);
      setAccordionItems(buildSortedAccordionByYearQuarter(forms, user.state));
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
