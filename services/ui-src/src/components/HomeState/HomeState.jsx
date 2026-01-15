import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem } from "@cmsgov/design-system";
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

  const loadForms = async stateId => {
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
      if (!user.state) {
        history.push("/register-state");
      }

      const forms = await loadForms(user.state);
      setAccordionItems(buildSortedAccordionByYearQuarter(forms, user.state));
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  console.log(accordionItems);

  return (
    <div className="page-home-state">
      <p className="instructions">
        Welcome to SEDS! Please select a Federal Fiscal Year and quarter below
        to view available reports.
      </p>

      <div className="quarterly-report-list">
        <Accordion bordered>
          {accordionItems.map((item, idx) => (
            <AccordionItem
              key={idx}
              defaultOpen={item.expanded}
              heading={item.title}
            >
              {item.content}
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default HomeState;
